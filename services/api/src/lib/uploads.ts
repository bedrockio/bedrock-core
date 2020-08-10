import * as config from '@bedrockio/config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const uploadLocal = (file, hash) => {
  const destinationPath = path.join(os.tmpdir(), hash);
  fs.copyFileSync(file.path, destinationPath);
  console.info('Uploading locally %s -> %s', file.name, destinationPath);

  return file.path;
};

const uploadGcs = async (file, hash) => {
  const { Storage } = require('@google-cloud/storage');
  const storage = new Storage();
  const bucketName = config.get('UPLOADS_GCS_BUCKET');
  const bucket = storage.bucket(bucketName);
  const extension = path.extname(file.name).toLowerCase();
  const options = {
    destination: `${hash}${extension}`,
  };
  await bucket.upload(file.path, options);
  console.info('Uploading gcs %s -> gs://%s/%s', file.name, bucketName, options.destination);
  const uploadedGcsFile = bucket.file(options.destination);
  await uploadedGcsFile.makePublic();
  const metaData = await uploadedGcsFile.getMetadata();
  return metaData[0].mediaLink;
};

const storeUploadedFile = async (uploadedFile) => {
  const object = {
    mimeType: uploadedFile.type,
    filename: uploadedFile.name,
    hash: crypto.randomBytes(32).toString('hex'),
    rawUrl: '',
    storageType: '',
    thumbnailUrl: '',
    ownerId: ''
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
};

export { storeUploadedFile };
