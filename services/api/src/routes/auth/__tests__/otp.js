const { assertSmsSent, assertSmsCount } = require('twilio');
const { assertMailSent, assertMailCount } = require('postmark');
const { createOtp } = require('../../../utils/auth/otp');
const { request, createUser } = require('../../../utils/testing');
const { assertAuthToken } = require('../../../utils/testing/tokens');
const { mockTime, unmockTime, advanceTime } = require('../../../utils/testing/time');
const { User } = require('../../../models');

describe('/1/auth/otp', () => {
  describe('POST /send', () => {
    describe('links', () => {
      it('should send an otp link via email by default', async () => {
        const email = 'foo@bar.com';
        await createUser({
          email,
        });
        const response = await request('POST', '/1/auth/otp/send', {
          email,
        });
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({
          challenge: {
            type: 'link',
            channel: 'email',
            email,
          },
        });

        assertMailSent({
          email,
          template: 'otp-login-link',
        });
      });

      it('should send an otp link via sms', async () => {
        const phone = '+15551234567';
        await createUser({
          phone,
        });
        const response = await request('POST', '/1/auth/otp/send', {
          phone,
          channel: 'sms',
        });
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({
          challenge: {
            type: 'link',
            channel: 'sms',
            phone,
          },
        });

        assertSmsSent({
          phone,
          template: 'otp-login-link',
        });
      });
    });

    describe('raw code', () => {
      it('should send a code to sms', async () => {
        const phone = '+15551234567';
        await createUser({
          phone,
        });
        const response = await request('POST', '/1/auth/otp/send', {
          phone,
          type: 'code',
          channel: 'sms',
        });
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({
          challenge: {
            type: 'code',
            channel: 'sms',
            phone,
          },
        });

        assertSmsSent({
          phone,
          template: 'otp-login-code',
        });
      });
    });

    it('should return empty response without sending if no user exists', async () => {
      const response = await request('POST', '/1/auth/otp/send', {
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          email: 'foo@bar.com',
          channel: 'email',
          type: 'link',
        },
      });

      assertSmsCount(0);
    });

    it('should create an OTP authenticator', async () => {
      let user = await createUser({
        phone: '+12223456789',
      });
      const response = await request('POST', '/1/auth/otp/send', {
        phone: '+12223456789',
      });
      expect(response.status).toBe(200);

      user = await User.findById(user.id);

      expect(user.authenticators).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'otp',
          }),
        ]),
      );
    });

    it('should clear previous OTP authenticators', async () => {
      let user = await createUser({
        phone: '+12223456789',
      });
      const oldCode = await createOtp(user);

      const response = await request('POST', '/1/auth/otp/send', {
        phone: '+12223456789',
      });
      expect(response.status).toBe(200);

      user = await User.findById(user.id);

      const authenticators = user.authenticators.filter((authenticator) => {
        return authenticator.type === 'otp';
      });
      expect(authenticators.length).toBe(1);
      expect(authenticators[0].code).not.toBe(oldCode);
    });

    it('should return a test code if the user is a tester', async () => {
      mockTime('2020-01-01');

      let response;

      let user = await createUser({
        email: 'tester@foo.com',
        isTester: true,
      });
      response = await request('POST', '/1/auth/otp/send', {
        email: 'tester@foo.com',
      });
      expect(response.status).toBe(200);
      expect(response.body.data.challenge.code).toBe('111111');

      response = await request('POST', '/1/auth/otp/login', {
        email: user.email,
        code: '111111',
      });

      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      assertMailCount(0);

      unmockTime();
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
          ]),
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
});
