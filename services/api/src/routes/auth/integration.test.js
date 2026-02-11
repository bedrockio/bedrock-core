const { assertSmsSent } = require('twilio');
const { assertMailSent } = require('postmark');
const { request, createUser } = require('../../utils/testing');
const { assertAuthToken } = require('../../utils/testing/tokens');
const { mockTime, unmockTime, advanceTime } = require('../../utils/testing/time');
const { User } = require('../../models');

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
      expect(response).toHaveStatus(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'code',
          channel: 'sms',
          phone: user.phone,
        },
      });

      assertSmsSent({
        phone: '+12223456789',
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
      expect(response).toHaveStatus(401);

      // Second attempt succeeded
      response = await request('POST', '/1/auth/otp/login', {
        code,
        phone: user.phone,
      });
      expect(response).toHaveStatus(200);
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
      expect(response).toHaveStatus(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'code',
          channel: 'email',
          email: user.email,
        },
      });

      assertMailSent({
        email: user.email,
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
      expect(response).toHaveStatus(401);

      // Second attempt succeeded
      response = await request('POST', '/1/auth/otp/login', {
        code,
        email: user.email,
      });
      expect(response).toHaveStatus(200);
      assertAuthToken(user, response.body.data.token);
    });

    it('should not verify recent password for simple otp', async () => {
      mockTime('2020-01-01T00:00:00.000Z');

      let response;

      let user = await createUser({
        phone: '+12223456789',
      });

      response = await request('POST', '/1/auth/otp/send', {
        type: 'code',
        channel: 'sms',
        phone: user.phone,
      });

      expect(response).toHaveStatus(200);

      advanceTime(10 * 60 * 1000);

      user = await User.findById(user.id);

      const { code } = user.authenticators.find((authenticator) => {
        return authenticator.type === 'otp';
      });

      response = await request('POST', '/1/auth/otp/login', {
        code,
        phone: user.phone,
      });

      expect(response).toHaveStatus(200);
      assertAuthToken(user, response.body.data.token);

      unmockTime();
    });

    it('should verify recent password in sms mfa flow', async () => {
      mockTime('2020-01-01T00:00:00.000Z');

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
      expect(response).toHaveStatus(200);

      user = await User.findById(user.id);

      advanceTime(10 * 60 * 1000);

      const { code } = user.authenticators.find((authenticator) => {
        return authenticator.type === 'otp';
      });

      // Attempt to verify OTP after expired.
      response = await request('POST', '/1/auth/otp/login', {
        code,
        phone: user.phone,
      });
      expect(response).toHaveStatus(401);

      unmockTime();
    });
  });
});
