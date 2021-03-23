const config = require('@bedrockio/config');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { createLogger } = require('./logging');

function uploadLocal(file, hash) {
  const logger = createLogger();
  const destinationPath = path.join(os.tmpdir(), hash);
  fs.copyFileSync(file.path, destinationPath);
  logger.debug('Uploading locally %s -> %s', file.name, destinationPath);
  return file.path;
}

async function uploadGcs(file, hash) {
  const logger = createLogger();
  const { Storage } = require('@google-cloud/storage');
  const storage = new Storage();
  const bucketName = config.get('UPLOADS_GCS_BUCKET');
  const bucket = storage.bucket(bucketName);
  const extension = path.extname(file.name).toLowerCase();
  const options = {
    destination: `${hash}${extension}`,
  };
  await bucket.upload(file.path, options);

  logger.info('Uploading gcs %s -> gs://%s/%s', file.name, bucketName, options.destination);
  const uploadedGcsFile = bucket.file(options.destination);
  await uploadedGcsFile.makePublic();
  const metaData = await uploadedGcsFile.getMetadata();
  return metaData[0].mediaLink;
}

async function storeUploadedFile(uploadedFile) {
  const object = {
    mimeType: uploadedFile.type,
    filename: uploadedFile.name,
    hash: crypto.randomBytes(32).toString('hex'),
  };
  if (config.get('UPLOADS_STORE') === 'gcs') {
    object.rawUrl = await uploadGcs(uploadedFile, object.hash);
    object.storageType = 'gcs';
  } else {
    object.rawUrl = uploadLocal(uploadedFile, object.hash);
    object.storageType = 'local';
  }
  object.thumbnailUrl = object.rawUrl;
  return object;
}

module.exports = { storeUploadedFile };
