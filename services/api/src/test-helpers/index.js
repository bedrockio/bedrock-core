const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').default;
const { uniqueId } = require('lodash');
const User = require('../models/user');

exports.context = require('./context');
exports.request = require('./request');

mongoose.Promise = Promise;

const mongoServer = new MongoMemoryServer();
exports.setupDb = () =>
  new Promise(async (resolve) => {
    mongoServer.getConnectionString().then((mongoUri) => {
      const mongooseOpts = {
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
      };

      mongoose.connect(mongoUri, mongooseOpts);

      mongoose.connection.on('error', (e) => {
        if (e.message.code === 'ETIMEDOUT') {
          console.error(e);
          mongoose.connect(mongoUri, mongooseOpts);
        }
        console.error(e);
      });

      mongoose.connection.once('open', () => {
        resolve();
      });
    });
  });

exports.createUser = async (userAttributes = {}) => {
  return await User.create({
    email: `${uniqueId('email')}@platform.com`,
    name: 'test user',
    ...userAttributes
  });
};

exports.teardownDb = async () => {
  await mongoServer.stop();
  await mongoose.disconnect();
};
