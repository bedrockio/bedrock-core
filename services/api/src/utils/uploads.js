const config = require('@bedrockio/config');
const { promises: fs } = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { logger } = require('@bedrockio/instrumentation');
const mime = require('mime-types');

async function uploadLocal(object) {
  const { filename, filepath, hash } = object;
  const destinationPath = path.join(os.tmpdir(), hash);
  await fs.copyFile(filepath, destinationPath);
  logger.debug('Uploading locally %s -> %s', filename, destinationPath);
  return filepath;
}

async function uploadGcs(object) {
  const { filename, filepath, hash } = object;
  const { Storage } = require('@google-cloud/storage');
  const storage = new Storage();
  const bucketName = config.get('UPLOADS_GCS_BUCKET');
  const bucket = storage.bucket(bucketName);
  const extension = path.extname(filename).toLowerCase();
  const options = {
    destination: `${hash}${extension}`,
  };
  await bucket.upload(filepath, options);

  logger.info('Uploading gcs %s -> gs://%s/%s', filename, bucketName, options.destination);
  const uploadedGcsFile = bucket.file(options.destination);
  await uploadedGcsFile.makePublic();
  const metaData = await uploadedGcsFile.getMetadata();
  return metaData[0].mediaLink;
}

async function storeUploadedFile(uploadedFile) {
  // https://github.com/node-formidable/formidable#file
  const filepath = uploadedFile.filepath || uploadedFile.path;
  const filename = uploadedFile.originalFilename || path.basename(filepath);
  const mimeType = uploadedFile.mimetype || mime.lookup(filename);
  const hash = crypto.randomBytes(32).toString('hex');

  const object = {
    hash,
    filename,
    filepath,
    mimeType,
  };

  if (config.get('UPLOADS_STORE') === 'gcs') {
    object.rawUrl = await uploadGcs(object);
    object.storageType = 'gcs';
  } else {
    object.rawUrl = await uploadLocal(object);
    object.storageType = 'local';
  }
  object.thumbnailUrl = object.rawUrl;
  return object;
}

module.exports = { storeUploadedFile };
