const mongoose = require('mongoose');
const { logger } = require('@bedrockio/instrumentation');
const { uniqueId } = require('lodash');

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

  await mongoose.connect(mongoURL, flags, (err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
  });
}

async function createUser(userAttributes = {}) {
  return await models.User.create({
    email: `${uniqueId('email')}@platform.com`,
    firstName: 'Test',
    lastName: 'User',
    ...userAttributes,
  });
}

async function createUserWithRole(scope, role, userAttributes = {}, scopeRef = undefined) {
  const email = `${uniqueId('email')}@platform.com`;
  return await models.User.create({
    email,
    firstName: 'Test',
    lastName: 'User',
    roles: [
      {
        scope,
        role,
        scopeRef,
      },
    ],
    ...userAttributes,
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
  createUserWithRole,
  teardownDb,
};
