const User = require('../user');
const mongoose = require('mongoose');
const { omit } = require('lodash');
const { context } = require('../../utils/testing');

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
    it('should validate email field', () => {
      let user;

      user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'good@email.com',
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'bad@email',
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);

      user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: null,
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);
    });
  });

  describe('addAuthToken', () => {
    it('should add a authToken', () => {
      const user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'good@email.com',
      });
      const exp = new Date();
      user.addAuthToken({ exp: exp / 1000, jti: 'abc' }, context({}));
      const authTokens = [...user.authTokens].map((t) => omit(t.toObject(), ['_id']));
      expect(authTokens).toEqual([{ exp, jti: 'abc', ip: '127.0.0.1', userAgent: '' }]);
    });

    it('should remove the expired entries', () => {
      const user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'good@email.com',
        authTokens: [
          {
            jti: 'a',
            exp: new Date(0),
          },
        ],
      });
      user.addAuthToken({ jti: 'b', exp: 10000 }, context({}));
      expect([...user.authTokens]).toHaveLength(1);
    });
  });
});
