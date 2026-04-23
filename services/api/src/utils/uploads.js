const os = require('os');
const path = require('path');
const { copyFile, stat, writeFile } = require('fs/promises');

const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');
const mime = require('mime-types');
const { Storage } = require('@google-cloud/storage');
const { Upload } = require('../models');
const { createAccessToken, verifyToken } = require('./tokens');
const { userHasAccess } = require('./permissions');

const API_URL = config.get('API_URL');
const BUCKET_NAME = config.get('UPLOADS_GCS_BUCKET');
const UPLOADS_STORE = config.get('UPLOADS_STORE');

const storage = new Storage();

const bucket = storage.bucket(BUCKET_NAME);

async function createUploads(arg, options) {
  const files = Array.isArray(arg) ? arg : [arg];
  return await Promise.all(
    files.map(async (file) => {
      return await createUpload(file, options);
    }),
  );
}

async function createUpload(file, attributes) {
  // https://github.com/node-formidable/formidable#file
  const filepath = file.filepath;

  let filename = file.originalFilename || file.filename || path.basename(filepath || '');

  // Silly issue with OSX having weird characters in screenshot
  // names that cause "invalid character" error.
  filename = filename.replace(/\u202F/g, ' ');

  file.filename ||= filename;

  const mimeType = file.mimetype || mime.lookup(filename);

  if (!mimeType) {
    throw new Error('Could not derive mime type.');
  }

  const upload = await Upload.create({
    ...attributes,
    filename,
    mimeType,
    storageType: UPLOADS_STORE,
  });

  if (UPLOADS_STORE === 'gcs') {
    await uploadGcs(file, upload);
  } else {
    await uploadLocal(file, upload);
  }

  return upload;
}

async function uploadLocal(file, upload) {
  const { filename, filepath, buffer, blob } = file;
  const destination = getUploadLocalPath(upload);
  if (filepath) {
    await copyFile(filepath, destination);
  } else if (buffer) {
    await writeFile(destination, buffer);
  } else if (blob) {
    await writeFile(destination, new Uint8Array(await blob.arrayBuffer()));
  } else {
    throw new Error('Cannot upload local file.');
  }

  logger.debug('Uploading locally %s -> %s', filename, destination);
  return destination;
}

async function uploadGcs(file, upload) {
  const { filepath, buffer, blob } = file;

  const destination = getUploadFilename(upload);
  const gcsFile = bucket.file(destination);

  logger.info('Uploading file gs://%s/%s', BUCKET_NAME, destination);

  const meta = {
    contentType: upload.mimeType,
    contentDisposition: `inline; filename="${upload.filename}"`,
  };

  if (buffer) {
    await gcsFile.save(buffer, meta);
  } else if (blob) {
    const arrayBuffer = await blob.arrayBuffer();
    await gcsFile.save(Buffer.from(arrayBuffer), meta);
  } else {
    await bucket.upload(filepath, {
      ...meta,
      destination,
    });
  }

  if (!upload.private) {
    await gcsFile.makePublic();
  }
}

// 6 hours
const SIGNED_URL_TTL = 6 * 60 * 60 * 1000;

// Browser-usable URL for the upload.
// For local storage, private uploads get a short-lived access token appended
// so `<audio>`/`<img>` tags can authenticate without sending headers.
async function getUploadUrl(upload, options = {}) {
  if (upload.storageType === 'local') {
    let url = `${API_URL}/1/uploads/${upload.id}/raw`;
    if (upload.private) {
      const { authUser } = options;
      const token = createAccessToken(authUser, {
        duration: '5m',
        upload: upload.id,
      });
      url += `?token=${token}`;
    }
    return url;
  } else {
    const file = getGcsFile(upload);
    if (upload.private) {
      // Note that although signed URLs allow temporary access to the file,
      // the files themselves are still private which means no cors headers
      // will ever be set on the response.
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: new Date().getTime() + SIGNED_URL_TTL,
      });
      return url;
    } else {
      return file.publicUrl();
    }
  }
}

function getUploadLocalPath(upload) {
  return path.join(os.tmpdir(), getUploadFilename(upload));
}

function validateAccess(ctx, upload) {
  if (!upload) {
    ctx.throw(404);
  }
  if (!upload.private) {
    return;
  }

  const { token } = ctx.query;
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded.kid === 'access' && decoded.upload === upload.id) {
        return;
      }
    } catch {
      // invalid/expired — fall through to bearer check
    }
  }

  const { authUser } = ctx.state;
  let allowed;
  if (!authUser) {
    allowed = false;
  } else if (authUser.equals(upload.owner)) {
    allowed = true;
  } else {
    allowed = userHasAccess(authUser, {
      endpoint: 'uploads',
      permission: 'read',
      scope: 'global',
    });
  }

  if (!allowed) {
    ctx.throw(401, 'Cannot access upload.');
  }
}

function getUploadFilename(upload) {
  return upload.id;
}

function getGcsFile(upload) {
  const bucket = storage.bucket(BUCKET_NAME);
  return bucket.file(getUploadFilename(upload));
}

// Parses a single-range `Range` header against the file at `filePath`.
// Returns `{ start, end, size }` inclusive, or null for no/invalid range.
async function parseRange(header, filePath) {
  if (!header) {
    return null;
  }
  const match = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return null;
  }
  const { size } = await stat(filePath);
  const [, startStr, endStr] = match;
  let start;
  let end;
  if (startStr === '') {
    // Suffix: last N bytes
    const suffix = Number(endStr);
    if (!suffix) {
      return null;
    }
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(startStr);
    end = endStr === '' ? size - 1 : Math.min(Number(endStr), size - 1);
  }
  if (start > end || start >= size) {
    return null;
  }
  return { start, end, size };
}

async function createUploadFromUrl(url, options) {
  const response = await fetch(url);

  const file = {
    ...parseResponseHeaders(response),
    buffer: Buffer.from(await response.arrayBuffer()),
  };

  return await createUpload(file, options);
}

function parseResponseHeaders(response) {
  const { headers } = response;

  let mimetype = headers.get('content-type') || 'application/octet-stream';

  // Strip out charset if it exists
  mimetype = mimetype.split(';')[0].trim();

  const disposition = headers.get('content-disposition');

  let filename;

  if (disposition) {
    filename = disposition.match(/filename="(.+)"/)?.[1];
  }

  filename ||= `file.${mime.extension(mimetype)}`;

  return {
    mimetype,
    filename,
  };
}

module.exports = {
  createUploads,
  createUpload,
  getUploadUrl,
  getUploadLocalPath,
  validateAccess,
  parseRange,
  createUploadFromUrl,
  getUploadFilename,
};
