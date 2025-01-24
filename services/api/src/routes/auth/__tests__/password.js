const jwt = require('jsonwebtoken');
const { assertSmsSent } = require('twilio');
const { assertMailSent } = require('postmark');
const { request, context, createUser } = require('../../../utils/testing');
const { mockTime, unmockTime, advanceTime } = require('../../../utils/testing/time');
const { createAuthToken, createTemporaryAuthToken } = require('../../../utils/auth/tokens');
const { verifyPassword } = require('../../../utils/auth/password');
const { assertAuthToken } = require('../../../utils/testing/tokens');
const { User } = require('../../../models');

function getJti(token) {
  const { payload } = jwt.decode(token, { complete: true });
  return payload.jti;
}

describe('/1/auth', () => {
  describe('POST /login', () => {
    it('should log in a user in', async () => {
      const password = '123password!';
      const user = await createUser({
        password,
      });
      const response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password,
      });
      expect(response.status).toBe(200);

      assertAuthToken(user, response.body.data.token);
    });

    it('should challenge with otp via sms', async () => {
      const user = await createUser({
        phone: '+12312312422',
        password: '123password!',
        mfaMethod: 'sms',
      });

      const response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password: '123password!',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.next).toEqual({
        type: 'otp',
        phone: '+12312312422',
      });

      assertSmsSent({
        to: '+12312312422',
      });
    });

    it('should challenge with otp via email', async () => {
      const user = await createUser({
        password: '123password!',
        mfaMethod: 'email',
      });

      const response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password: '123password!',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.next).toEqual({
        type: 'otp',
        email: user.email,
      });

      assertMailSent({
        to: user.email,
      });
    });

    it('should store the new token payload on the user', async () => {
      mockTime('2020-01-01T00:00:00.000Z');
      const password = '123password!';
      let user = await createUser({
        password,
      });

      const response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password,
      });
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.authTokens).toEqual([
        expect.objectContaining({
          jti: getJti(response.body.data.token),
          expiresAt: new Date('2020-01-31T00:00:00.000Z'),
        }),
      ]);
      unmockTime();
    });

    it('should challenge password login via sms otp', async () => {
      const password = '123password!';
      const user = await createUser({
        password,
        mfaMethod: 'sms',
        phone: '+12223456789',
      });
      const response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password,
      });
      expect(response.status).toBe(200);
      expect(response.body.data.next).toEqual({
        type: 'otp',
        phone: '+12223456789',
      });

      assertSmsSent({
        to: '+12223456789',
      });
    });

    it('should remove expired auth tokens', async () => {
      mockTime('2020-01-01');
      const password = '123password!';
      let user = await createUser({
        password,
      });
      createAuthToken(context(), user);
      await user.save();

      // 2 months
      advanceTime(60 * 24 * 60 * 60 * 1000);
      await request('POST', '/1/auth/password/login', {
        email: user.email,
        password,
      });

      user = await User.findById(user.id);
      expect(user.authTokens.length).toBe(1);

      unmockTime();
    });

    describe('login throttling', () => {
      it('should not throttle up to 5 attempts', async () => {
        mockTime('2020-01-01');

        let response;

        const password = '123password!';
        const user = await createUser({
          password,
          loginAttempts: 4,
          lastLoginAttemptAt: new Date(),
        });

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(200);

        unmockTime();
      });

      it('should throttle 1 minute up to 10 attempts', async () => {
        mockTime('2020-01-01');

        let response;

        const password = '123password!';
        const user = await createUser({
          password,
          loginAttempts: 6,
          lastLoginAttemptAt: new Date(),
        });

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(401);

        advanceTime(59 * 1000);
        user.loginAttempts = 9;
        await user.save();

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(401);

        advanceTime(60 * 1000);
        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(200);

        unmockTime();
      });

      it('should throttle 1 hour after 10 attempts', async () => {
        mockTime('2020-01-01');

        let response;

        const password = '123password!';
        const user = await createUser({
          password,
          loginAttempts: 10,
          lastLoginAttemptAt: new Date(),
        });

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(401);

        advanceTime(59 * 60 * 1000);
        await user.save();

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(401);

        advanceTime(60 * 60 * 1000);
        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
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

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(200);

        advanceTime(1000);

        response = await request('POST', '/1/auth/password/login', { email: user.email, password });
        expect(response.status).toBe(200);

        unmockTime();
      });
    });
  });

  describe('POST /register', () => {
    it('should be able to register with email', async () => {
      const email = 'foo@bar.com';

      const response = await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email,
      });
      expect(response.status).toBe(200);

      assertMailSent({
        to: email,
      });

      const user = await User.findOne({
        email,
      });

      assertAuthToken(user, response.body.data.token);
      expect(user.email).toBe(email);
    });

    it('should error on duplicated emails', async () => {
      await createUser({
        email: 'foo@bar.com',
      });

      const response = await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that email already exists.');
    });

    it('should error on duplicated emails with different casing', async () => {
      await createUser({
        email: 'foo@bar.com',
      });

      const response = await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'FOO@BAR.COM',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that email already exists.');
    });

    it('should not hint at existing emails on production', async () => {
      process.env.ENV_NAME = 'production';
      await createUser({
        email: 'foo@bar.com',
      });

      const response = await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('An error occurred.');

      process.env.ENV_NAME = 'test';
    });

    it('should error on duplicated phone number', async () => {
      await createUser({
        phone: '+12223456789',
      });

      const response = await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
        phone: '+12223456789',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that phone number already exists.');
    });

    it('should not hint at existing phone numbers on production', async () => {
      process.env.ENV_NAME = 'production';
      await createUser({
        phone: '+12223456789',
      });

      const response = await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
        phone: '+12223456789',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('An error occurred.');

      process.env.ENV_NAME = 'test';
    });

    it('should add to authenticators', async () => {
      mockTime('2020-01-01');
      await request('POST', '/1/auth/password/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
      });

      const user = await User.findOne({
        email: 'foo@bar.com',
      });

      expect(user.authenticators).toMatchObject([
        {
          type: 'password',
          verifiedAt: new Date('2020-01-01'),
        },
      ]);
      unmockTime();
    });
  });

  describe('POST /request', () => {
    it('should send an email to the registered user', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/password/request', {
        email: user.email,
      });
      expect(response.status).toBe(204);
      assertMailSent({
        to: user.email,
      });
    });

    it('should set a temporary token', async () => {
      mockTime('2020-01-01T00:00:00.000Z');
      let user = await createUser();
      await request('POST', '/1/auth/password/request', {
        email: user.email,
      });

      user = await User.findById(user.id);

      expect(user.authTokens).toEqual([
        expect.objectContaining({
          expiresAt: new Date('2020-01-01T01:00:00.000Z'),
        }),
      ]);
      unmockTime();
    });

    it('should not error on unknown user', async () => {
      const email = 'email@email.com';
      const response = await request('POST', '/1/auth/password/request', {
        email,
      });
      expect(response.status).toBe(204);
    });
  });

  describe('POST /update', () => {
    it('should allow a user to set a password', async () => {
      let user = await createUser();
      const password = 'very new password';
      const token = createTemporaryAuthToken(context(), user);
      await user.save();

      const response = await request(
        'POST',
        '/1/auth/password/update',
        {
          password,
        },
        {
          token,
        }
      );

      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);

      user = await User.findById(user.id);
      await expect(verifyPassword(user, password)).resolves.not.toThrow();

      expect(user.authTokens).toEqual([
        expect.objectContaining({
          jti: getJti(token),
        }),
        expect.objectContaining({
          jti: getJti(response.body.data.token),
        }),
      ]);
    });

    it('should error without user', async () => {
      const response = await request('POST', '/1/auth/password/update', {
        password: 'new password',
      });
      expect(response.status).toBe(401);
    });

    it('should only be valid for 1 hour', async () => {
      mockTime('2020-01-01T00:00:00.000Z');
      const user = await createUser();
      const token = createTemporaryAuthToken(context(), user);
      await user.save();

      let response = await request(
        'POST',
        '/1/auth/password/update',
        {
          password: 'new password',
        },
        {
          token,
        }
      );
      expect(response.status).toBe(200);

      advanceTime(60 * 60 * 1000);
      response = await request(
        'POST',
        '/1/auth/password/update',
        {
          password: 'even newer password!',
        },
        {
          token,
        }
      );
      expect(response.status).toBe(401);
      unmockTime();
    });

    it('should not consume token on unsuccessful attempt', async () => {
      let user = await createUser();
      const token = createTemporaryAuthToken(context(), user);
      await user.save();

      let response = await request(
        'POST',
        '/1/auth/password/update',
        {
          password: 'even newer password!',
        },
        {
          token: 'bad token',
        }
      );
      expect(response.status).toBe(401);

      user = await User.findById(user.id);
      expect(user.authTokens).toEqual([
        expect.objectContaining({
          jti: getJti(token),
        }),
      ]);
    });

    it('should handle invalid tokens', async () => {
      const password = 'very new password';
      const response = await request(
        'POST',
        '/1/auth/password/update',
        {
          password,
        },
        {
          token: 'bad',
        }
      );
      expect(response.status).toBe(401);
      expect(response.body.error.type).toBe('token');
      expect(response.body.error.message).toBe('bad jwt token');
    });
  });
});
