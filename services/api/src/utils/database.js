const mongoose = require('mongoose');
const logger = require('@bedrockio/logger');

const { MONGO_URI, MONGO_DEBUG } = process.env;

mongoose.Promise = Promise;

// https://mongoosejs.com/docs/migrating_to_6.html#no-more-deprecation-warning-options
// No More Deprecation Warning Options
// useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options. Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false. Please remove these options from your code.

const flags = {
  // // The underlying MongoDB driver has deprecated their current connection string parser.
  // useNewUrlParser: true,
  // // Make Mongoose's default index build use createIndex() instead of ensureIndex()
  // // to avoid deprecation warnings from the MongoDB driver
  // useCreateIndex: true,
  // // To opt in to using the MongoDB driver's new connection management engine.
  // // https://mongoosejs.com/docs/deprecations.html#useunifiedtopology
  // useUnifiedTopology: true,
  // // Set to false to make findOneAndUpdate() and findOneAndRemove()
  // // use native findOneAndUpdate() rather than findAndModify()
  // useFindAndModify: false,
};
exports.flags = flags;

exports.initialize = async function initialize() {
  mongoose.set('strictQuery', false);
  await mongoose.connect(MONGO_URI, flags);

  if (MONGO_DEBUG) {
    mongoose.set('debug', true);
  }

  const db = mongoose.connection;

  db.on('error', () => {
    logger.error('connection error');
  });
  return db;
};
