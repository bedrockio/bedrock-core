const mongoose = require('mongoose');
const { uniqueId } = require('lodash');

const context = require('./context');
const request = require('./request');

const { loadModelDir } = require('./../schema');
const models = loadModelDir(__dirname + '/../../models');

async function setupDb() {
  const mongooseOpts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };
  // ENVs are set by jest-mongodb:
  // console.log(global.__MONGO_URI__);
  // console.log(global.__MONGO_DB_NAME__);
  // Take the URI path from MONGO_URI with the default db name,
  // and replace with per test unique db name: MONGO_DB_NAME
  const mongoURL = 'mongodb://' + global.__MONGO_URI__.split('/')[2] + '/' + global.__MONGO_DB_NAME__;

  await mongoose.connect(mongoURL, mongooseOpts, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

async function defaultOrganization() {
  return (
    (await models.Organization.findOne({ name: 'Default' })) || (await models.Organization.create({ name: 'Default' }))
  );
}

async function createUser(userAttributes = {}) {
  return await models.User.create({
    email: `${uniqueId('email')}@platform.com`,
    name: 'test user',
    ...userAttributes,
  });
}

async function createUserWithRole(scope, role, userAttributes = {}, scopeRef = undefined) {
  const email = `${uniqueId('email')}@platform.com`;
  return await models.User.create({
    email,
    name: 'test user',
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
