const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('./utils.js');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});
