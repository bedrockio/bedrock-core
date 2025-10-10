const { request, createUser } = require('../../utils/testing');
const { createPasskeyToken } = require('../../utils/tokens');
const { assertAuthToken } = require('../../utils/testing/tokens');
const { mockTime, unmockTime } = require('../../utils/testing/time');
const { User } = require('../../models');

function getPasskey() {
  return {
    type: 'passkey',
    info: {
      id: 'id',
      publicKey: Buffer.from('public-key').toString('base64url'),
    },
  };
}

describe('/1/auth/passkeys', () => {
  describe('POST /generate-login', () => {
    it('should return authentication options', async () => {
      const response = await request('POST', '/1/auth/passkey/generate-login', {});
      expect(response).toHaveStatus(200);
      expect(response.body.data.options).toEqual({
        rpID: 'rpID',
        challenge: 'challenge',
        allowCredentials: [],
        userVerification: 'preferred',
        timeout: 60000,
      });
    });
  });

  describe('POST /verify-login', () => {
    it('should verify a good response', async () => {
      mockTime('2020-01-01');
      let user = await createUser({
        authenticators: [getPasskey()],
      });

      const token = createPasskeyToken({
        challenge: 'challenge',
      });

      const response = await request('POST', '/1/auth/passkey/verify-login', {
        token,
        response: {
          id: 'id',
          type: 'good',
        },
      });

      expect(response).toHaveStatus(200);
      assertAuthToken(user, response.body.data.token);

      user = await User.findById(user.id);

      expect(user.authenticators.toObject()).toMatchObject([
        {
          type: 'passkey',
          lastUsedAt: new Date(),
        },
      ]);
      unmockTime();
    });

    it('should error on a bad response', async () => {
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request('POST', '/1/auth/passkey/verify-login', {
        email: user.email,
        response: {
          type: 'bad',
        },
      });
      expect(response).toHaveStatus(400);
    });

    it('should error if user does not exist', async () => {
      const response = await request('POST', '/1/auth/passkey/verify-login', {
        email: 'foo@bar.com',
        response: {
          type: 'good',
        },
      });
      expect(response).toHaveStatus(400);
    });

    it('should error if user does not have passkey', async () => {
      const user = await createUser();

      const response = await request('POST', '/1/auth/passkey/verify-login', {
        email: user.email,
        response: {
          type: 'good',
        },
      });
      expect(response).toHaveStatus(400);
    });
  });

  describe('POST /generate-new', () => {
    it('should return authentication options for authenticated user', async () => {
      let user = await createUser();

      const response = await request(
        'POST',
        '/1/auth/passkey/generate-new',
        {},
        {
          user,
        },
      );
      expect(response).toHaveStatus(200);
      expect(response.body.data.options).toMatchObject({
        challenge: 'challenge',
        user: {
          id: 'id',
          name: user.email,
        },
        timeout: 60000,
      });

      user = await User.findById(user.id);
      expect(user.authenticators.length).toBe(0);
    });

    it('should error without authentication', async () => {
      const response = await request('POST', '/1/auth/passkey/generate-new', {
        email: 'foo@bar.com',
      });
      expect(response).toHaveStatus(401);
    });
  });

  describe('POST /verify-new', () => {
    it('should verify a good response', async () => {
      mockTime('2020-01-01');
      let user = await createUser();

      const token = createPasskeyToken({
        challenge: 'challenge',
      });

      const response = await request(
        'POST',
        '/1/auth/passkey/verify-new',
        {
          token,
          response: {
            type: 'good',
          },
        },
        {
          user,
        },
      );
      expect(response).toHaveStatus(200);
      expect(response.body.data).toMatchObject({
        id: user.id,
      });

      user = await User.findById(user.id);
      expect(user.authenticators.toObject()).toMatchObject([
        {
          type: 'passkey',
          name: 'Passkey 1',
          createdAt: new Date('2020-01-01'),
          info: {
            id: 'id',
          },
        },
      ]);
      unmockTime();
    });

    it('should derive name from platform', async () => {
      let user = await createUser();

      const token = createPasskeyToken({
        challenge: 'challenge',
      });

      await request(
        'POST',
        '/1/auth/passkey/verify-new',
        {
          token,
          response: {
            type: 'good',
          },
        },
        {
          user,
          headers: {
            'sec-ch-ua-platform': '"macOS"',
          },
        },
      );

      user = await User.findById(user.id);
      expect(user.authenticators.toObject()).toMatchObject([
        {
          type: 'passkey',
          name: 'macOS',
        },
      ]);
    });

    it('should error on a bad response', async () => {
      const token = createPasskeyToken({
        challenge: 'challenge',
      });
      const user = await createUser({
        authenticators: [getPasskey()],
      });

      const response = await request(
        'POST',
        '/1/auth/passkey/verify-new',
        {
          token,
          response: {
            type: 'bad',
          },
        },
        {
          user,
        },
      );
      expect(response.body.error.message).toBe('Bad registration response.');
    });

    it('should error if not authenticated', async () => {
      const response = await request('POST', '/1/auth/passkey/verify-new', {
        response: {
          type: 'good',
        },
      });
      expect(response).toHaveStatus(401);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a passkey', async () => {
      let user = await createUser({
        authenticators: [getPasskey()],
      });

      const id = user.authenticators[0].id;

      const response = await request(
        'DELETE',
        `/1/auth/passkey/${id}`,
        {},
        {
          user,
        },
      );
      expect(response).toHaveStatus(200);

      user = await User.findById(user.id);
      expect(user.authenticators.toObject()).toEqual([]);
    });

    it('should error if not authenticated', async () => {
      const response = await request('DELETE', '/1/auth/passkey/id', {});
      expect(response).toHaveStatus(401);
    });
  });
});
