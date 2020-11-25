const jwt = require('jsonwebtoken');
const tokens = require('../../lib/tokens');
const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');
const { User } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/auth', () => {
  describe('POST login', () => {
    it('should log in a user in', async () => {
      const password = '123password!';
      const user = await createUser({
        password,
      });
      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');
    });
  });

  describe('POST /register', () => {
    it('should handle success', async () => {
      const email = 'some@email.com';
      const password = 'password1';
      const name = 'bob';
      const response = await request('POST', '/1/auth/register', { name, email, password });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const updatedUser = await User.findOne({
        email,
      });

      expect(updatedUser.email).toBe(email);
    });
  });

  describe('POST /request-password', () => {
    it('it should send an email to the registered user', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/request-password', {
        email: user.email,
      });
      expect(response.status).toBe(204);
    });

    it('it should send an email to the unknown user', async () => {
      const email = 'email@email.com';
      const response = await request('POST', '/1/auth/request-password', {
        email,
      });
      expect(response.status).toBe(204);
    });
  });

  describe('POST /set-password', () => {
    it('it should allow a user to set a password', async () => {
      const user = await createUser();
      const password = 'very new password';
      const token = tokens.createUserTemporaryToken({ userId: user._id }, 'password');
      const response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const updatedUser = await User.findById(user._id);
      expect(await updatedUser.verifyPassword(password)).toBe(true);
    });

    it('should handle invalid tokens', async () => {
      const password = 'very new password';
      const response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password,
        },
        {
          headers: {
            Authorization: 'Bearer badtoken',
          },
        }
      );
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: { message: 'bad jwt token', status: 401 } });
    });
  });
});
