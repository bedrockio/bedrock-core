const mongoose = require('mongoose');
const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');

mongoose.Promise = Promise;

const flags = {};
exports.flags = flags;

exports.initialize = async function initialize() {
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
};
