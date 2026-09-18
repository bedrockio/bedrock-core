import mongoose from 'mongoose';
import config from '@bedrockio/config';
import logger from '@bedrockio/logger';

mongoose.Promise = Promise;

export const flags = {};

export async function initialize() {
  mongoose.set('strictQuery', false);
  await mongoose.connect(config.get('MONGO_URI'), flags);

  if (config.get('MONGO_DEBUG', 'boolean')) {
    mongoose.set('debug', true);
  }

  const db = mongoose.connection;

  db.on('error', () => {
    logger.error('connection error');
  });
  return db;
}
