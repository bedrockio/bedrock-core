const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { copyFile, writeFile } = require('fs/promises');

const logger = require('@bedrockio/logger');
const mime = require('mime-types');
const Readable = require('stream').Readable;
const { Storage } = require('@google-cloud/storage');
const { Upload } = require('../models');

const { UPLOADS_STORE, UPLOADS_GCS_BUCKET } = process.env;

const storage = new Storage();

const bucket = storage.bucket(UPLOADS_GCS_BUCKET);

async function createUploads(arg, options) {
  const files = Array.isArray(arg) ? arg : [arg];
  return await Promise.all(
    files.map(async (file) => {
      return await createUpload(file, options);
    })
  );
}

async function createUpload(file, attributes) {
  // https://github.com/node-formidable/formidable#file
  const filepath = file.filepath;

  let filename = file.originalFilename || file.filename || path.basename(filepath || '');

  // Silly issue with OSX having weird characters in screenshot
  // names that cause "invalid character" error.
  filename = filename.replace(/\u202F/g, ' ');

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
  const { filename, filepath, buffer } = file;
  const destination = await getUploadUrl(upload);
  if (filepath) {
    await copyFile(filepath, destination);
  } else if (buffer) {
    await writeFile(destination, buffer);
  } else {
    throw new Error('Cannot upload local file.');
  }

  logger.debug('Uploading locally %s -> %s', filename, destination);
  return destination;
}

async function uploadGcs(file, upload) {
  const { filepath, buffer } = file;

  const filename = path.basename(filepath);
  const destination = getUploadFilename(upload);
  const gcsFile = bucket.file(destination);

  logger.info('Uploading gcs %s -> gs://%s/%s', filename, UPLOADS_GCS_BUCKET, destination);

  if (buffer) {
    await gcsFile.save(buffer);
  } else {
    await bucket.upload(filepath, {
      contentType: upload.mimeType,
      destination,
    });
  }

  if (!upload.private) {
    await gcsFile.makePublic();
  }
}

// 6 hours
const SIGNED_URL_TTL = 6 * 60 * 60 * 1000;

async function getUploadUrl(upload) {
  if (upload.storageType === 'local') {
    return path.join(os.tmpdir(), getUploadFilename(upload));
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

function getUploadFilename(upload) {
  return upload.id;
}

function getGcsFile(upload) {
  const bucket = storage.bucket(UPLOADS_GCS_BUCKET);
  return bucket.file(getUploadFilename(upload));
}

function createUrlStream(url) {
  if (url.startsWith('http')) {
    // Create a readable stream from the response
    const readableStream = new Readable({
      read() {
        // This function will be called when the stream is read from
        // You can use it to push data into the stream
      },
    });

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          throw new Error(`Failed to download ${url}.`);
        }

        response.on('data', (chunk) => {
          // Push the received data into the readable stream
          readableStream.push(chunk);
        });

        response.on('end', () => {
          // Signal the end of the stream
          readableStream.push(null);
        });
      })
      .on('error', (error) => {
        throw new Error(error.message);
      });

    return readableStream;
  } else {
    return fs.createReadStream(url);
  }
}

module.exports = {
  createUploads,
  createUpload,
  getUploadUrl,
  createUrlStream,
  getUploadFilename,
};
