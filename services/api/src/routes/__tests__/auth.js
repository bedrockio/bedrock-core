const jwt = require('jsonwebtoken');
const { createTemporaryToken, generateTokenId } = require('../../utils/tokens');
const { setupDb, teardownDb, request, createUser } = require('../../utils/testing');
const { mockTime, unmockTime, advanceTime } = require('../../utils/testing/time');
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

    it('should throttle a few seconds after 3 bad attempts', async () => {
      mockTime();

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 3,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      await request('POST', '/1/auth/login', { email: user.email, password: 'bad password' });

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(401);

      advanceTime(60 * 1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should throttle 1 hour after 10 bad attempts', async () => {
      mockTime();

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 9,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(401);

      advanceTime(60 * 60 * 1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should not throttle after successful login attempt', async () => {
      mockTime();

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 10,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      advanceTime(60 * 60 * 1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      advanceTime(1000);

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should set the authTokenId on login', async () => {
      const password = '123password!';
      let user = await createUser({
        password,
      });

      let response;

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.authTokenId).not.toBeUndefined();
    });
  });

  describe('POST /register', () => {
    it('should handle success', async () => {
      const email = 'some@email.com';
      const password = '123password!';
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

  describe('POST /logout', () => {
    it('should changed authTokenId on logout', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/logout', {}, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authTokenId).not.toBeDefined();
    });
  });

  describe('POST /request-password', () => {
    it('should send an email to the registered user', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/request-password', {
        email: user.email,
      });
      expect(response.status).toBe(204);
    });

    it('should set a temporary token id', async () => {
      let user = await createUser();
      await request('POST', '/1/auth/request-password', {
        email: user.email,
      });
      user = await User.findById(user.id);
      expect(user.tempTokenId).not.toBeUndefined();
    });

    it('should return with 400 for unknown user', async () => {
      const email = 'email@email.com';
      const response = await request('POST', '/1/auth/request-password', {
        email,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /set-password', () => {
    it('should allow a user to set a password', async () => {
      const tokenId = generateTokenId();
      const user = await createUser({
        tempTokenId: tokenId,
      });
      const password = 'very new password';
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
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

      const updatedUser = await User.findById(user.id);
      await expect(async () => {
        await updatedUser.verifyPassword(password);
      }).not.toThrow();
    });

    it('should error when user is not found', async () => {
      const token = createTemporaryToken({ type: 'password', sub: 'invalid user' });
      const response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'new password',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });

    it('should only allow a token to be used once', async () => {
      const user = await createUser();
      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      user.tempTokenId = tokenId;
      user.save();
      let response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'new password',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status).toBe(200);

      response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'even newer password!',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status).toBe(400);
    });

    it('should not consume token on unsuccessful attempt', async () => {
      let user = await createUser();
      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      user.tempTokenId = 'different id';
      user.save();

      let response = await request(
        'POST',
        '/1/auth/set-password',
        {
          password: 'even newer password!',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(response.status).toBe(400);

      user = await User.findById(user.id);
      expect(user.tempTokenId).not.toBeUndefined();
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
