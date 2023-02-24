const mongoose = require('mongoose');
const logger = require('@bedrockio/logger');

async function setupDb() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(global.__MONGO_URI__, {
      // Databases are unique per test file.
      dbName: global.__MONGO_DB_NAME__,
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

async function teardownDb() {
  await mongoose.disconnect();
}

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});
