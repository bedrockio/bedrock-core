const mongoose = require('mongoose');
const { User, Upload } = require('../../models');

const context = require('./context');
const request = require('./request');

async function createUser(attributes) {
  return User.create({
    // using an objectId to ensure when tests are executed in parallel, there is no overlap
    email: `${mongoose.Types.ObjectId()}@platform.com`,
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
  createUser,
  createUpload,
  createAdminUser,
};
