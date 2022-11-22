const jwt = require('jsonwebtoken');
const { assertMailSent } = require('postmark');
const { createTemporaryToken, generateTokenId } = require('../../utils/tokens');
const { setupDb, teardownDb, request, createUser } = require('../../utils/testing');
const { mockTime, unmockTime, advanceTime } = require('../../utils/testing/time');
const { User, Invite } = require('../../models');
const { verifyPassword } = require('../../utils/auth');

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

    it('should login a user user with mfa enabled', async () => {
      const password = '123password!';
      const user = await createUser({
        password,
        mfaMethod: 'otp',
      });
      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.mfaToken, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'mfa');
    });

    it('should throttle a few seconds after 5 bad attempts', async () => {
      mockTime('2020-01-01');

      const password = '123password!';
      const user = await createUser({
        password,
        loginAttempts: 5,
        lastLoginAttemptAt: new Date(),
      });
      let response;

      response = await request('POST', '/1/auth/login', { email: user.email, password: 'bad password' });

      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(401);

      advanceTime(60 * 1000);
      response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      unmockTime();
    });

    it('should throttle 1 hour after 10 bad attempts', async () => {
      mockTime('2020-01-01');

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
      mockTime('2020-01-01');

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

      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);
      const decodeToken = jwt.decode(response.body.data.token, { complete: true });
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authTokens).toHaveLength(1);
      const entry = updatedUser.authTokens[0];
      expect(entry.jti).toBe(decodeToken.payload.jti);
      expect(entry.exp.valueOf()).toBe(decodeToken.payload.exp * 1000);
    });
  });

  describe('POST /register', () => {
    it('should handle success', async () => {
      const email = 'some@email.com';
      const password = '123password!';
      const firstName = 'Bob';
      const lastName = 'Johnson';
      let response = await request('POST', '/1/auth/register', { firstName, lastName, email, password });
      expect(response.status).toBe(200);

      assertMailSent({ to: email });

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const updatedUser = await User.findOne({
        email,
      });

      expect(updatedUser.email).toBe(email);

      response = await request('POST', '/1/auth/register', { firstName, lastName, email, password });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /confirm-access', () => {
    it('should allow users to confirm they own the account by enter their password', async () => {
      const password = 'burgerfuntime';
      const user = await createUser({
        password,
        accessConfirmedAt: new Date(Date.now() - 1000),
      });

      const response = await request(
        'POST',
        '/1/auth/confirm-access',
        {
          password,
        },
        { user }
      );
      expect(response.status).toBe(204);
      const dbUser = await User.findById(user.id);
      expect(dbUser.accessConfirmedAt.valueOf()).toBeGreaterThan(user.accessConfirmedAt.valueOf());
    });

    it('should block user if limit is reached', async () => {
      const user = await createUser({
        lastLoginAttemptAt: new Date(),
        loginAttempts: 10,
      });
      let response = await request('POST', '/1/auth/confirm-access', { password: 'bad password' }, { user });
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Too many attempts. Try again in 15 minute(s)');
    });
  });

  describe('POST /logout', () => {
    it('should remove all tokens', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/logout', { all: true }, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authTokens).toHaveLength(0);
    });
  });

  describe('POST /accept-invite', () => {
    it('should send an email to the registered user', async () => {
      const invite = await Invite.create({
        email: 'some@email.com',
        status: 'invited',
      });
      const token = createTemporaryToken({ type: 'invite', inviteId: invite.id, email: invite.email });
      const response = await request(
        'POST',
        '/1/auth/accept-invite',
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          password: '123password!',
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

      const user = await User.findById(payload.sub);
      expect(user.firstName).toBe('Bob');
      expect(user.lastName).toBe('Johnson');
    });
  });

  describe('POST /request-password', () => {
    it('should send an email to the registered user', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/request-password', {
        email: user.email,
      });
      expect(response.status).toBe(204);
      assertMailSent({ to: user.email });
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
      await expect(verifyPassword(updatedUser, password)).resolves.not.toThrow();
      expect(updatedUser.tempTokenId).not.toBeDefined();
      expect(updatedUser.authTokens).toHaveLength(1);
      expect(updatedUser.authTokens[0].jti).toContain(payload.jti);
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
      await user.save();

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
      expect(response.body).toEqual({ error: { type: 'token', message: 'bad jwt token', status: 401 } });
    });
  });
});
