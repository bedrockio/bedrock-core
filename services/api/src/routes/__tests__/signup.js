const { assertSmsSent } = require('twilio');
const { assertMailSent } = require('postmark');
const { request, createUser } = require('../../utils/testing');
const { assertAuthToken } = require('../../utils/testing/tokens');
const { User } = require('../../models');

describe('POST /signup', () => {
  describe('password', () => {
    it('should be able to sign up with a password', async () => {
      const email = 'foo@bar.com';

      const response = await request('POST', '/1/signup', {
        type: 'password',
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
      expect(user.authTokens.length).toBe(1);
      expect(user.emailVerified).toBe(false);
      expect(user.authenticators).toMatchObject([
        {
          type: 'password',
        },
      ]);

      assertMailSent({
        to: user.email,
        template: 'welcome',
      });
    });

    it('should error if no password provided', async () => {
      const email = 'foo@bar.com';

      const response = await request('POST', '/1/signup', {
        type: 'password',
        firstName: 'Bob',
        lastName: 'Johnson',
        email,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Password is required.');
    });
  });

  describe('email otp', () => {
    it('should send otp link via email by default', async () => {
      const email = 'foo@bar.com';

      const response = await request('POST', '/1/signup', {
        type: 'link',
        firstName: 'Bob',
        lastName: 'Johnson',
        email,
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'link',
          transport: 'email',
          email,
        },
      });

      assertMailSent({
        to: email,
        template: 'otp-signup-link',
      });

      const user = await User.findOne({
        email,
      });

      expect(user.email).toBe(email);
      expect(user.emailVerified).toBe(false);
      expect(user.authenticators).toMatchObject([
        {
          type: 'otp',
        },
      ]);
    });

    it('should send just the code if specified', async () => {
      const email = 'foo@bar.com';

      const response = await request('POST', '/1/signup', {
        type: 'code',
        firstName: 'Bob',
        lastName: 'Johnson',
        email,
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'code',
          transport: 'email',
          email,
        },
      });

      assertMailSent({
        to: email,
        template: 'otp-signup-code',
      });

      const user = await User.findOne({
        email,
      });

      expect(user.email).toBe(email);
      expect(user.emailVerified).toBe(false);
      expect(user.authenticators).toMatchObject([
        {
          type: 'otp',
        },
      ]);
    });

    it('should error if no email is provided', async () => {
      const response = await request('POST', '/1/signup', {
        type: 'code',
        transport: 'email',
        firstName: 'Bob',
        lastName: 'Johnson',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Email is required.');
    });
  });

  describe('sms otp', () => {
    it('should send otp link via sms', async () => {
      const phone = '+15551234567';

      const response = await request('POST', '/1/signup', {
        type: 'link',
        transport: 'sms',
        firstName: 'Bob',
        lastName: 'Johnson',
        phone,
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'link',
          transport: 'sms',
          phone,
        },
      });

      assertSmsSent({
        to: phone,
        template: 'otp-signup-link',
      });

      const user = await User.findOne({
        phone,
      });

      expect(user.phone).toBe(phone);
      expect(user.phoneVerified).toBe(false);
      expect(user.authenticators).toMatchObject([
        {
          type: 'otp',
        },
      ]);
    });

    it('should send just the code if specified', async () => {
      const phone = '+15551234567';

      const response = await request('POST', '/1/signup', {
        type: 'code',
        transport: 'sms',
        firstName: 'Bob',
        lastName: 'Johnson',
        phone,
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: {
          type: 'code',
          transport: 'sms',
          phone,
        },
      });

      assertSmsSent({
        to: phone,
        template: 'otp-signup-code',
      });

      const user = await User.findOne({
        phone,
      });

      expect(user.phone).toBe(phone);
      expect(user.phoneVerified).toBe(false);
      expect(user.authenticators).toMatchObject([
        {
          type: 'otp',
        },
      ]);
    });
  });

  describe('errors', () => {
    it('should error if no first name passed', async () => {
      const response = await request('POST', '/1/signup', {
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('"firstName" is required.');
    });

    it('should error if email used', async () => {
      const email = 'foo@bar.com';

      await createUser({
        email,
      });
      const response = await request('POST', '/1/signup', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that email already exists.');
    });

    it('should error if phone number used', async () => {
      const phone = '+15551234567';

      await createUser({
        phone,
      });

      const response = await request('POST', '/1/signup', {
        firstName: 'Bob',
        lastName: 'Johnson',
        password: '123password!',
        email: 'foo@bar.com',
        phone,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('A user with that phone number already exists.');
    });
  });
});
