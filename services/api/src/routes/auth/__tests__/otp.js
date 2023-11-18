const { assertSmsSent, assertSmsCount } = require('twilio');
const { assertMailSent } = require('postmark');
const { createOtp } = require('../../../utils/auth/otp');
const { request, createUser } = require('../../../utils/testing');
const { assertAuthToken } = require('../../../utils/testing/tokens');
const { mockTime, unmockTime, advanceTime } = require('../../../utils/testing/time');
const { User } = require('../../../models');

describe('/1/auth/otp', () => {
  describe('POST /send-code', () => {
    it('should send an otp code via sms', async () => {
      const user = await createUser({
        phone: '+12223456789',
      });
      const response = await request('POST', '/1/auth/otp/send-code', {
        phone: user.phone,
      });
      expect(response.status).toBe(204);

      assertSmsSent({
        to: user.phone,
      });
    });

    it('should send an otp code via email', async () => {
      const user = await createUser({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/otp/send-code', {
        email: user.email,
      });
      expect(response.status).toBe(204);

      assertMailSent({
        to: user.email,
      });
    });

    it('should return empty response without sending if no user exists', async () => {
      const response = await request('POST', '/1/auth/otp/send-code', {
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(204);

      assertSmsCount(0);
    });

    it('should create an OTP authenticator', async () => {
      let user = await createUser({
        phone: '+12223456789',
      });
      const response = await request('POST', '/1/auth/otp/send-code', {
        phone: '+12223456789',
      });
      expect(response.status).toBe(204);

      user = await User.findById(user.id);

      expect(user.authenticators).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'otp',
          }),
        ])
      );
    });

    it('should clear previous OTP authenticators', async () => {
      let user = await createUser({
        phone: '+12223456789',
      });
      const oldCode = await createOtp(user);

      const response = await request('POST', '/1/auth/otp/send-code', {
        phone: '+12223456789',
      });
      expect(response.status).toBe(204);

      user = await User.findById(user.id);

      const authenticators = user.authenticators.filter((authenticator) => {
        return authenticator.type === 'otp';
      });
      expect(authenticators.length).toBe(1);
      expect(authenticators[0].code).not.toBe(oldCode);
    });
  });

  describe('POST /login', () => {
    describe('simple', () => {
      it('should verify an otp code via email', async () => {
        const user = await createUser({
          email: 'foo@bar.com',
        });
        const code = await createOtp(user);
        const response = await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code,
        });
        expect(response.status).toBe(200);
        assertAuthToken(user, response.body.data.token);
      });

      it('should verify an otp code via phone', async () => {
        const user = await createUser({
          phone: '+12223456789',
        });
        const code = await createOtp(user);
        const response = await request('POST', '/1/auth/otp/login', {
          phone: user.phone,
          code,
        });
        expect(response.status).toBe(200);
        assertAuthToken(user, response.body.data.token);
      });

      it('should not allow validation past an hour', async () => {
        mockTime('2020-01-01');
        const user = await createUser({
          phone: '+12223456789',
        });
        const code = await createOtp(user);

        advanceTime(60 * 60 * 1000);
        const response = await request('POST', '/1/auth/otp/login', {
          phone: user.phone,
          code,
        });
        expect(response.status).toBe(401);
        unmockTime();
      });

      it('should throw an error if user not found', async () => {
        const response = await request('POST', '/1/auth/otp/login', {
          phone: '+12223456789',
          code: '123456',
        });
        expect(response.status).toBe(400);
      });

      it('should throw an error if code is incorrect', async () => {
        const user = await createUser({
          phone: '+12223456789',
        });
        await createOtp(user);
        const response = await request('POST', '/1/auth/otp/login', {
          phone: user.phone,
          code: '123456',
        });
        expect(response.status).toBe(401);
        expect(response.body.error.message).toBe('Incorrect code.');
      });

      it('should clear consumed OTP authenticator', async () => {
        let user = await createUser({
          phone: '+12223456789',
        });
        const code = await createOtp(user);
        await request('POST', '/1/auth/otp/login', {
          phone: user.phone,
          code,
        });

        user = await User.findById(user.id);

        expect(user.authenticators).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'otp',
            }),
          ])
        );
      });

      it('should verify email address', async () => {
        let user = await createUser({
          email: 'foo@bar.com',
        });
        const code = await createOtp(user);
        await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code,
        });

        user = await User.findById(user.id);
        expect(user.emailVerified).toBe(true);
      });

      it('should verify phone number', async () => {
        let user = await createUser({
          phone: '+12223456789',
        });
        const code = await createOtp(user);
        await request('POST', '/1/auth/otp/login', {
          phone: user.phone,
          code,
        });

        user = await User.findById(user.id);
        expect(user.phoneVerified).toBe(true);
      });

      it('should throttle logins', async () => {
        mockTime('2020-01-01');
        let response;

        const user = await createUser({
          loginAttempts: 5,
          lastLoginAttemptAt: new Date(),
        });
        const code = await createOtp(user);

        response = await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code: '000000',
        });
        expect(response.status).toBe(401);

        response = await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code,
        });
        expect(response.status).toBe(401);

        advanceTime(60 * 1000);
        response = await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code,
        });
        expect(response.status).toBe(200);

        unmockTime();
      });
    });

    describe('mfa', () => {
      it('should issue token if password was verified', async () => {
        const user = await createUser({
          email: 'foo@bar.com',
          password: '12345',
        });
        const code = await createOtp(user);
        const response = await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code,
        });
        expect(response.status).toBe(200);
        assertAuthToken(user, response.body.data.token);
      });

      it('should not issue token if password was not recently verified', async () => {
        mockTime('2020-01-01T00:00:00.000Z');
        const user = await createUser({
          email: 'foo@bar.com',
          password: '12345',
        });
        advanceTime(60 * 60 * 1000);
        const code = await createOtp(user);
        const response = await request('POST', '/1/auth/otp/login', {
          email: user.email,
          code,
        });
        expect(response.status).toBe(401);
        expect(response.body.error.message).toBe('Password not verified.');
        unmockTime();
      });
    });
  });

  describe('POST /register', () => {
    it('should create a new user without a password', async () => {
      const response = await request('POST', '/1/auth/otp/register', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        email: 'foo@bar.com',
      });
      const user = await User.findOne({
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
    });
  });
});
