const User = require('../user');
const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('../../utils/testing');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('User', () => {
  describe('serialization', () => {
    it('should expose id', () => {
      const user = new User();
      const data = JSON.parse(JSON.stringify(user));
      expect(data.id).toBe(user.id);
    });

    it('should not expose _id or __v', () => {
      const user = new User();
      const data = JSON.parse(JSON.stringify(user));
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
    });

    it('should not expose _password or hashedPassword', () => {
      const user = new User({
        password: 'fake password',
        hashedPassword: 'fake hash',
      });
      expect(user._password).toBe('fake password');
      expect(user.hashedPassword).toBe('fake hash');

      const data = JSON.parse(JSON.stringify(user));
      expect(data.password).toBeUndefined();
      expect(data._password).toBeUndefined();
      expect(data.hashedPassword).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should validate email field', async () => {
      let user;

      user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'good@email.com',
      });
      await expect(user.validate()).resolves.not.toThrow();

      user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'bad@email',
      });
      await expect(user.validate()).rejects.toThrow(mongoose.Error.ValidationError);

      user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: null,
      });
      await expect(user.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('createAuthToken', () => {
    it('should add an authToken', () => {
      const user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'good@email.com',
      });

      user.createAuthToken({ ip: '122.312.31.2', userAgent: 'test' });
      const authInfo = user.authInfo;
      expect(authInfo[0].ip).toEqual('122.312.31.2');
      expect(authInfo[0].userAgent).toEqual('test');
      expect(authInfo.length).toBe(1);
    });
  });
});
