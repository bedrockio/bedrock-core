const { request, createUser } = require('../../../utils/testing');
const { assertAuthToken } = require('../../../utils/testing/tokens');
const { User } = require('../../../models');

function getPasskey() {
  return {
    type: 'passkey',
    id: Buffer.from('id').toString('base64url'),
    publicKey: Buffer.from('public-key').toString('base64url'),
  };
}

describe('/1/auth/passkeys', () => {
  describe('POST /login-generate', () => {
    it('should return authentication options for existing user', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request('POST', '/1/auth/passkey/login-generate', {
        email: user.email,
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        challenge: `id-challenge`,
        allowCredentials: [
          {
            id: 'aWQ',
            type: 'public-key',
          },
        ],
        userVerification: 'preferred',
        timeout: 60000,
      });
    });

    it('should error for non-existing user', async () => {
      const response = await request('POST', '/1/auth/passkey/login-generate', {
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(404);
    });

    it('should error if existing user does not have a passkey', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/auth/passkey/login-generate', {
        email: user.email,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('No passkey set.');
    });
  });

  describe('POST /login-verify', () => {
    it('should verify a good response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request('POST', '/1/auth/passkey/login-verify', {
        email: user.email,
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
    });

    it('should error on a bad response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request('POST', '/1/auth/passkey/login-verify', {
        email: user.email,
        response: {
          type: 'bad',
        },
      });
      expect(response.status).toBe(400);
    });

    it('should error if user does not exist', async () => {
      const response = await request('POST', '/1/auth/passkey/login-verify', {
        email: 'foo@bar.com',
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(400);
    });

    it('should error if user does not have passkey', async () => {
      const user = await createUser();

      const response = await request('POST', '/1/auth/passkey/login-verify', {
        email: user.email,
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /register-generate', () => {
    it('should return register options', async () => {
      const response = await request('POST', '/1/auth/passkey/register-generate', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(200);

      const user = await User.findOne({
        email: 'foo@bar.com',
      });

      expect(response.body.data).toMatchObject({
        challenge: 'register-challenge',
        user: {
          id: user.id,
          name: user.email,
          displayName: user.name,
        },
        timeout: 60000,
      });
    });

    it('should error error if user exists', async () => {
      await createUser({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/passkey/register-generate', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /register-verify', () => {
    it('should verify a good response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request('POST', '/1/auth/passkey/register-verify', {
        email: user.email,
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);
    });

    it('should error on a bad response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request('POST', '/1/auth/passkey/register-verify', {
        email: user.email,
        response: {
          type: 'bad',
        },
      });
      expect(response.status).toBe(400);
    });

    it('should error if user does not exist', async () => {
      const response = await request('POST', '/1/auth/passkey/register-verify', {
        email: 'foo@bar.com',
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(400);
    });

    it('should error if user does not have passkey', async () => {
      const user = await createUser();

      const response = await request('POST', '/1/auth/passkey/register-verify', {
        email: user.email,
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /enable-generate', () => {
    it('should return authentication options for authenticated user', async () => {
      const user = await createUser();

      const response = await request(
        'POST',
        '/1/auth/passkey/enable-generate',
        {},
        {
          user,
        }
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        challenge: 'register-challenge',
        user: {
          id: user.id,
          name: user.email,
          displayName: user.name,
        },
        timeout: 60000,
      });
    });

    it('should clear existing passkeys', async () => {
      const passkey = getPasskey();
      let user = await createUser({
        authenticators: [passkey],
      });
      const response = await request(
        'POST',
        '/1/auth/passkey/enable-generate',
        {},
        {
          user,
        }
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.authenticators.length).toBe(1);
      expect(user.authenticators[0]).toMatchObject({
        type: 'passkey',
        secret: 'register-challenge',
      });
    });

    it('should error without authentication', async () => {
      const response = await request('POST', '/1/auth/passkey/enable-generate', {
        email: 'foo@bar.com',
      });
      expect(response.status).toBe(401);
    });
  });

  describe('POST /enable-verify', () => {
    it('should verify a good response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request(
        'POST',
        '/1/auth/passkey/enable-verify',
        {
          response: {
            type: 'good',
          },
        },
        {
          user,
        }
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: user.id,
      });
    });

    it('should error on a bad response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request(
        'POST',
        '/1/auth/passkey/enable-verify',
        {
          email: user.email,
          response: {
            type: 'bad',
          },
        },
        {
          user,
        }
      );
      expect(response.status).toBe(400);
    });

    it('should error if not authenticated', async () => {
      const response = await request('POST', '/1/auth/passkey/enable-verify', {
        response: {
          type: 'good',
        },
      });
      expect(response.status).toBe(401);
    });

    it('should error if user does not have passkey', async () => {
      const user = await createUser();

      const response = await request(
        'POST',
        '/1/auth/passkey/enable-verify',
        {
          response: {
            type: 'good',
          },
        },
        {
          user,
        }
      );
      expect(response.status).toBe(400);
    });
  });

  describe('POST /disable', () => {
    it('should remove passkey authenticators', async () => {
      let user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request(
        'POST',
        '/1/auth/passkey/disable',
        {},
        {
          user,
        }
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.authenticators).toEqual([]);
    });

    it('should error if not authenticated', async () => {
      const response = await request('POST', '/1/auth/passkey/disable', {});
      expect(response.status).toBe(401);
    });
  });
});
