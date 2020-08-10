import mongoose from 'mongoose';
import MongoMemoryServer from 'mongodb-memory-server' //.default
import uniqueId from 'lodash';
import User from '../models/user';
import { context } from './context';

mongoose.Promise = Promise;

const mongoServer = new MongoMemoryServer();
const setupDb = () =>
  new Promise((resolve) => {
    mongoServer.getConnectionString().then((mongoUri) => {
      const mongooseOpts = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
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

const createUser = async (userAttributes = {}) => {
  return await User.create({
    email: `${uniqueId('email')}@platform.com`,
    name: 'test user',
    ...userAttributes
  });
};

const teardownDb = async () => {
  await mongoServer.stop();
  await mongoose.disconnect();
};

export { context }
export { createUser }
export { teardownDb }
