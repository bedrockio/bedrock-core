const User = require('./user');
const mongoose = require('mongoose');

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

    it('should not expose password hash', async () => {
      const user = new User({
        firstName: 'Neo',
        lastName: 'One',
        email: 'foo@bar.com',
        password: 'fake password',
      });
      expect(user._password).toBe('fake password');
      await user.save();

      const data = JSON.parse(JSON.stringify(user));
      expect(data.password).toBeUndefined();
      expect(data._password).toBeUndefined();
      expect(data.authenticators).toBeUndefined();
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

  describe('password', () => {
    it('should not add an authenticator with a null password', async () => {
      const user = await User.create({
        firstName: 'Neo',
        lastName: 'One',
        email: 'foo@bar.com',
        password: null,
      });
      expect(user.authenticators).toEqual([]);
    });
  });
});
