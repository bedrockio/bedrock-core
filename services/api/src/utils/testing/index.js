const mongoose = require('mongoose');
const { User, Upload } = require('../../models');

const context = require('./context');
const request = require('./request');

async function createUser(attributes = {}) {
  const user = new User({
    // using an objectId to ensure when tests are executed in parallel, there is no overlap
    email: `${new mongoose.Types.ObjectId()}@platform.com`,
    firstName: 'Test',
    lastName: 'User',
    ...attributes,
  });
  await user.save();
  return user;
}

async function createAdmin(attributes) {
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

async function createUpload(attributes) {
  return await Upload.create({
    filename: 'test.png',
    rawUrl: 'test.png',
    hash: 'test',
    storageType: 'local',
    mimeType: 'image/png',
    owner: new mongoose.Types.ObjectId(),
    ...attributes,
  });
}

module.exports = {
  context,
  request,
  createUser,
  createUpload,
  createAdmin,
};
