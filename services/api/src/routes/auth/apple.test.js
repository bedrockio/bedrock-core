const { createToken } = require('verify-apple-id-token');
const { request, createUser } = require('../../utils/testing');
const { assertAuthToken } = require('../../utils/testing/tokens');
const { hasAuthenticator } = require('../../utils/auth/authenticators');
const { upsertAppleAuthenticator } = require('../../utils/auth/apple');
const { mockTime, unmockTime } = require('../../utils/testing/time');
const { User } = require('../../models');

describe('/1/auth/apple', () => {
  describe('POST /', () => {
    it('should verify a token for new user', async () => {
      const email = 'foo@bar.com';
      const token = createToken({
        email,
      });
      const response = await request('POST', '/1/auth/apple', {
        token,
        firstName: 'Frank',
        lastName: 'Reynolds',
      });
      expect(response.status).toBe(200);
      expect(response.body.data.result).toBe('signup');

      const user = await User.findOne({
        email,
      });

      expect(user.email).toBe(email);
    });

    it('should verify a token for an existing user', async () => {
      const user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/apple', {
        token,
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
      expect(response.body.data.result).toBe('login');
    });

    it('should not be able to register with an unverified email', async () => {
      const token = createToken({
        givenName: 'Frank',
        familyName: 'Reynolds',
        email: 'foo@bar.com',
        email_verified: false,
      });
      const response = await request('POST', '/1/auth/apple', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        token,
      });
      expect(response.status).toBe(400);
    });

    it('should add authenticator if none', async () => {
      mockTime('2020-01-01');

      let user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/apple', {
        token,
      });

      expect(response.status).toBe(200);
      user = await User.findById(user.id);
      expect(user.authenticators).toMatchObject([
        {
          type: 'apple',
          createdAt: new Date('2020-01-01'),
        },
      ]);

      unmockTime();
    });

    it('should not add multiple authenticators', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        email: 'foo@bar.com',
      });

      await request('POST', '/1/auth/apple', {
        token,
      });

      await request('POST', '/1/auth/apple', {
        token,
      });

      user = await User.findById(user.id);
      expect(user.authenticators.length).toBe(1);
    });

    it('should throw an error on a bad token', async () => {
      const response = await request('POST', '/1/auth/apple', {
        token: 'bad',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /enable', () => {
    it('should add authenticator', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        givenName: 'Frank',
        familyName: 'Reynolds',
        email: 'foo@bar.com',
      });
      const response = await request(
        'POST',
        '/1/auth/apple/enable',
        {
          token,
        },
        {
          user,
        },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);

      user = await User.findById(user.id);
      expect(hasAuthenticator(user, 'apple')).toBe(true);
    });

    it('should validate token', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const response = await request(
        'POST',
        '/1/auth/apple/enable',
        {
          token: 'bad-token',
        },
        {
          user,
        },
      );
      expect(response.status).toBe(400);
    });
  });

  describe('POST disable', () => {
    it('should remove authenticator', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      upsertAppleAuthenticator(user);
      await user.save();

      const response = await request(
        'POST',
        '/1/auth/apple/disable',
        {},
        {
          user,
        },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);

      user = await User.findById(user.id);
      expect(hasAuthenticator(user, 'apple')).toBe(false);
    });
  });
});
