import crypto from 'crypto';
import { inject } from 'vitest';
import mongoose from 'mongoose';
import logger from '@bedrockio/logger';

async function setupDb() {
  try {
    mongoose.set('strictQuery', false);
    // Each file gets a fresh database; creating every model's collection and indexes in it was the cost.
    mongoose.set('autoCreate', false);
    mongoose.set('autoIndex', false);
    await mongoose.connect(inject('mongoUri'), {
      // Databases are unique per test file.
      dbName: crypto.randomUUID(),
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
