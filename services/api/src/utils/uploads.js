import os from 'os';
import path from 'path';
import { copyFile, stat, writeFile } from 'fs/promises';

import config from '@bedrockio/config';
import logger from '@bedrockio/logger';
import mime from 'mime-types';
import { Storage } from '@google-cloud/storage';
import { Upload } from '../models/index.js';
import { createUploadToken, verifyToken } from './tokens.js';
import { userHasAccess } from './permissions.js';

const API_URL = config.get('API_URL');
const APP_URL = config.get('APP_URL');
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
// For local storage, private uploads get a short-lived token appended so
// `<audio>`/`<img>` tags can authenticate without sending headers. The token is
// scoped to this upload and names no user, so callers need only prove access
// before asking for the URL — there is nothing to attribute it to.
async function getUploadUrl(upload) {
  if (upload.storageType === 'local') {
    let url = `${API_URL}/1/uploads/${upload.id}/raw`;
    if (upload.private) {
      url += `?token=${createUploadToken(upload)}`;
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

async function createResumableUpload(attributes) {
  const upload = await Upload.create({
    ...attributes,
    storageType: UPLOADS_STORE,
  });

  const file = getGcsFile(upload);

  const isPublic = !upload.private;

  const [url] = await file.createResumableUpload({
    // Must match the browser origin exactly: GCS pins it from this request and
    // echoes it as the CORS header on every chunk PUT, so the bucket's own CORS
    // config is never consulted.
    origin: APP_URL,
    // Bake the public-read ACL into the write. makePublic() (used by the
    // at-once path) can't work here: the client writes the bytes, so the server
    // never sees a finalized object to ACL afterward. predefinedAcl applies it
    // as GCS finalizes the object. Private uploads serve via signed URLs.
    ...(isPublic && {
      predefinedAcl: 'publicRead',
    }),
  });

  return {
    url,
    upload,
  };
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
      if (decoded.kid === 'upload' && decoded.upload === upload.id) {
        return;
      }
    } catch {
      // invalid/expired — fall through to bearer check
    }
  }

  // A private upload is readable by its owner, by anyone with upload access
  // within their organization, and by global ("super admin") users.
  const { authUser, organization } = ctx.state;
  let allowed;
  if (!authUser) {
    allowed = false;
  } else if (authUser.equals(upload.owner)) {
    allowed = true;
  } else {
    allowed = userHasOrganizationAccess(authUser, organization);
    allowed ||= userHasGlobalAccess(authUser);
  }

  if (!allowed) {
    ctx.throw(401, 'Cannot access upload.');
  }
}

function userHasOrganizationAccess(user, organization) {
  if (!organization) {
    return;
  }
  return userHasAccess(user, {
    endpoint: 'uploads',
    permission: 'read',
    scope: 'organization',
    scopeRef: organization.id,
  });
}

function userHasGlobalAccess(user) {
  return userHasAccess(user, {
    endpoint: 'uploads',
    permission: 'read',
    scope: 'global',
  });
}

function getUploadFilename(upload) {
  const { id, mimeType } = upload;
  const ext = mime.extension(mimeType);
  return `${id}.${ext}`;
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

export {
  createUploads,
  createUpload,
  getUploadUrl,
  getUploadLocalPath,
  validateAccess,
  parseRange,
  createResumableUpload,
};
