const { assertSmsSent } = require('twilio');
const { assertMailSent } = require('postmark');
const { createOtp } = require('../../../utils/auth/otp');
const { request, createUser } = require('../../../utils/testing');
const { assertAuthToken } = require('../../../utils/testing/tokens');
const { mockTime, unmockTime, advanceTime } = require('../../../utils/testing/time');
const { User } = require('../../../models');

describe('mfa', () => {
  describe('user based', () => {
    it('should authenticate a user in sms mfa flow', async () => {
      let response;

      let user = await createUser({
        phone: '+12223456789',
        password: '123456789abcd',
        mfaMethod: 'sms',
      });

      // Login met with mfa challenge
      response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password: '123456789abcd',
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'code',
          transport: 'sms',
          phone: user.phone,
        },
      });

      assertSmsSent({
        to: '+12223456789',
      });

      user = await User.findById(user.id);

      const { code } = user.authenticators.find((authenticator) => {
        return authenticator.type === 'otp';
      });

      // First attempt at submitting code failed
      response = await request('POST', '/1/auth/otp/login', {
        code: '000000',
        phone: user.phone,
      });
      expect(response.status).toBe(401);

      // Second attempt succeeded
      response = await request('POST', '/1/auth/otp/login', {
        code,
        phone: user.phone,
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
    });

    it('should authenticate a user in email mfa flow', async () => {
      let response;

      let user = await createUser({
        phone: '+12223456789',
        password: '123456789abcd',
        mfaMethod: 'email',
      });

      // Login met with mfa challenge
      response = await request('POST', '/1/auth/password/login', {
        email: user.email,
        password: '123456789abcd',
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'code',
          transport: 'email',
          email: user.email,
        },
      });

      assertMailSent({
        to: user.email,
      });

      user = await User.findById(user.id);

      const { code } = user.authenticators.find((authenticator) => {
        return authenticator.type === 'otp';
      });

      // First attempt at submitting code failed
      response = await request('POST', '/1/auth/otp/login', {
        code: '000000',
        email: user.email,
      });
      expect(response.status).toBe(401);

      // Second attempt succeeded
      response = await request('POST', '/1/auth/otp/login', {
        code,
        email: user.email,
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
    });

    it('should not allow code verification when password not verified recently', async () => {
      mockTime('2020-01-01T00:00:00.000Z');
      let response;

      let user = await createUser({
        phone: '+12223456789',
        password: '123456789abcd',
        mfaMethod: 'sms',
      });

      const code = await createOtp(user);

      advanceTime(10 * 60 * 1000);

      // Second attempt succeeded
      response = await request('POST', '/1/auth/otp/login', {
        code,
        phone: user.phone,
      });
      expect(response.status).toBe(401);

      unmockTime();
    });
  });
});
