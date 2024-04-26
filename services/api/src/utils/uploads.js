const os = require('os');
const path = require('path');
const mime = require('mime-types');
const { promises: fs } = require('fs');

const crypto = require('crypto');
const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');

const { Upload } = require('../models');

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
  const filepath = uploadedFile.filepath;
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

async function createUpload(file, options) {
  const { owner } = options;

  // Note: this function will be passed ids by the
  // fixture importer so it must be able to accept them.
  const ownerId = owner.id || owner;

  const params = await storeUploadedFile(file);
  return await Upload.create({
    ...params,
    owner: ownerId,
  });
}

module.exports = {
  createUpload,
};
