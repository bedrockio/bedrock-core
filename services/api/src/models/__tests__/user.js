const User = require('../user');
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
        email: 'good@email.com',
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        email: 'bad@email',
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);

      user = new User({
        email: null,
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);
    });
  });
});
