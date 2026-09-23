import fs from 'fs';
import { syncBuiltinESMExports } from 'module';
import mongoose from 'mongoose';
import { User, Upload, Template } from '../../models/index.js';

import context from './context.js';
import request from './request.js';

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
        role: 'admin',
      },
    ],
  });
}

async function createSuperAdmin(attributes) {
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
    storageType: 'local',
    mimeType: 'image/png',
    user: new mongoose.Types.ObjectId(),
    ...attributes,
  });
}

async function createTemplate(attributes) {
  return await Template.create({
    type: ['email', 'sms', 'push'],
    name: 'template',
    email: 'email',
    sms: 'sms',
    push: 'push',
    ...attributes,
  });
}

// @bedrockio/templates imports readFileSync by name, which only sees
// a spy on fs once the builtin's named exports are re-synced.
function mockReadFileSync(fn) {
  vi.spyOn(fs, 'readFileSync').mockImplementation(fn);
  syncBuiltinESMExports();
}

function restoreMocks() {
  vi.restoreAllMocks();
  syncBuiltinESMExports();
}

export {
  context,
  mockReadFileSync,
  restoreMocks,
  request,
  createUser,
  createUpload,
  createTemplate,
  createAdmin,
  createSuperAdmin,
};
