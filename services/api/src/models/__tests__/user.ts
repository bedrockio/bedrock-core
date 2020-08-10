import User from '../../models/user';

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

    it('should not expose _password or hashedPassword serialize', () => {
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

    it('should not allow hashedPassword to be set via assignment', () => {
      const user = new User({
        hashedPassword: 'fake hash',
      });
      user.assign({
        hashPassword: 'new fake hash',
      });
      expect(user.hashedPassword).toBe('fake hash');
    });

  });
});
