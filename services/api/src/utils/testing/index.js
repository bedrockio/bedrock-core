const mongoose = require('mongoose');
const { uniqueId } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');

const context = require('./context');
const request = require('./request');
const { flags } = require('../database');

const { loadModelDir } = require('./../schema');
const models = loadModelDir(__dirname + '/../../models');

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

async function createUser(attributes = {}) {
  return await models.User.create({
    email: `${uniqueId('email')}@platform.com`,
    name: 'test user',
    ...attributes,
  });
}

function createAdminUser(attributes) {
  return createUser({
    ...attributes,
    roles: [
      {
        scope: 'global',
        role: 'superAdmin',
      },
    ],
  });
}

async function createUpload(user = {}) {
  return await models.Upload.create({
    filename: 'logo.png',
    rawUrl: 'logo.png',
    hash: 'test',
    storageType: 'local',
    mimeType: 'image/png',
    ownerId: user.id || 'none',
  });
}

async function teardownDb() {
  await mongoose.disconnect();
}

module.exports = {
  context,
  request,
  setupDb,
  createUser,
  createAdminUser,
  createUpload,
  teardownDb,
};
