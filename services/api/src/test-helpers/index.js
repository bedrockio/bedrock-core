const mongoose = require('mongoose');
const { uniqueId } = require('lodash');
const User = require('../models/user');

exports.context = require('./context');
exports.request = require('./request');

exports.setupDb = async () => {
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
};

exports.createUser = async (userAttributes = {}) => {
  return await User.create({
    email: `${uniqueId('email')}@platform.com`,
    name: 'test user',
    ...userAttributes,
  });
};

exports.teardownDb = async () => {
  await mongoose.disconnect();
};
