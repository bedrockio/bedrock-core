const mongoose = require('mongoose');
const { uniqueId } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');
const { User, Upload } = require('../../models');

const context = require('./context');
const request = require('./request');
const { flags } = require('../database');

async function setupDb() {
  // ENVs are set by jest-mongodb:
  // global.__MONGO_URI__;
  // global.__MONGO_DB_NAME__;
  // Take the URI path from MONGO_URI with the default db name,
  // and replace with per test unique db name: MONGO_DB_NAME
  const mongoURL = 'mongodb://' + global.__MONGO_URI__.split('/')[2] + '/' + global.__MONGO_DB_NAME__;

  try {
    await mongoose.connect(mongoURL, flags);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

async function teardownDb() {
  await mongoose.disconnect();
}

async function createUser(attributes = {}) {
  return await User.create({
    email: `${uniqueId('email')}@platform.com`,
    firstName: 'Test',
    lastName: 'User',
    ...attributes,
  });
}

async function createAdminUser(attributes) {
  return await createUser({
    ...attributes,
    roles: [
      {
        scope: 'global',
        role: 'superAdmin',
      },
    ],
  });
}

async function createUpload(owner) {
  return await Upload.create({
    filename: 'test.png',
    rawUrl: 'test.png',
    hash: 'test',
    storageType: 'local',
    mimeType: 'image/png',
    owner: owner || mongoose.Types.ObjectId(),
  });
}

module.exports = {
  context,
  request,
  setupDb,
  teardownDb,
  createUser,
  createUpload,
  createAdminUser,
};
