const { createToken } = require('google-auth-library');
const { request, createUser } = require('../../../utils/testing');
const { assertAuthToken } = require('../../../utils/testing/tokens');
const { hasAuthenticator } = require('../../../utils/auth/authenticators');
const { addGoogleAuthenticator } = require('../google/utils');
const { User } = require('../../../models');

describe('/1/auth/google', () => {
  describe('POST login', () => {
    it('should verify a token for new user', async () => {
      const token = createToken({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/login', {
        token,
      });
      expect(response.status).toBe(200);
      expect(response.body.data.next).toBe('signup');
    });

    it('should verify a token for an existing user', async () => {
      const user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/login', {
        token,
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
    });

    it('should add authenticator if none', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/login', {
        token,
      });

      expect(response.status).toBe(200);
      user = await User.findById(user.id);
      expect(user.authenticators).toMatchObject([
        {
          type: 'google',
        },
      ]);
    });

    it('should not add multiple authenticators', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        email: 'foo@bar.com',
      });

      await request('POST', '/1/auth/google/login', {
        token,
      });

      await request('POST', '/1/auth/google/login', {
        token,
      });

      user = await User.findById(user.id);
      expect(user.authenticators.length).toBe(1);
    });

    it('should throw an error on a bad token', async () => {
      const response = await request('POST', '/1/auth/google/login', {
        token: 'bad',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST register', () => {
    it('should be able to sign up', async () => {
      const token = createToken({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/register', {
        firstName: 'Bob',
        lastName: 'Johnson',
        token,
      });
      expect(response.status).toBe(200);
      const user = await User.findOne({
        email: 'foo@bar.com',
      });
      expect(user).toMatchObject({
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'foo@bar.com',
      });
    });

    it('should be able to override provided name', async () => {
      const token = createToken({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/register', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        token,
      });
      expect(response.status).toBe(200);
      const user = await User.findOne({
        email: 'foo@bar.com',
      });
      expect(user).toMatchObject({
        firstName: 'Frank',
        lastName: 'Reynolds',
        email: 'foo@bar.com',
      });
    });

    it('should not be able to override provided email', async () => {
      const token = createToken({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/register', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        email: 'bar@foo.com',
        token,
      });
      expect(response.status).toBe(400);
    });

    it('should not be able to register with an unverified email', async () => {
      const token = createToken({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
        email_verified: false,
      });
      const response = await request('POST', '/1/auth/google/register', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        token,
      });
      expect(response.status).toBe(400);
    });

    it('should throw an error on a bad token', async () => {
      const response = await request('POST', '/1/auth/google/register', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        token: 'bad',
      });
      expect(response.status).toBe(400);
    });

    it('should add an authenticator', async () => {
      const token = createToken({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google/register', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        token,
      });
      expect(response.status).toBe(200);
      const user = await User.findOne({
        email: 'foo@bar.com',
      });

      expect(user.authenticators).toMatchObject([
        {
          type: 'google',
        },
      ]);
    });
  });

  describe('POST enable', () => {
    it('should add authenticator', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const token = createToken({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
      });
      const response = await request(
        'POST',
        '/1/auth/google/enable',
        {
          token,
        },
        {
          user,
        }
      );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);

      user = await User.findById(user.id);
      expect(hasAuthenticator(user, 'google')).toBe(true);
    });

    it('should validate token', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const response = await request(
        'POST',
        '/1/auth/google/enable',
        {
          token: 'bad-token',
        },
        {
          user,
        }
      );
      expect(response.status).toBe(400);
    });
  });

  describe('POST disable', () => {
    it('should remove authenticator', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      addGoogleAuthenticator(user);
      await user.save();

      const response = await request(
        'POST',
        '/1/auth/google/disable',
        {},
        {
          user,
        }
      );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);

      user = await User.findById(user.id);
      expect(hasAuthenticator(user, 'google')).toBe(false);
    });
  });
});
