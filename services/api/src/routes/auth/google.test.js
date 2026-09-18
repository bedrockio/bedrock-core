import { createCode } from 'google-auth-library';
import { request, createUser } from '../../utils/testing/index.js';
import { assertAuthToken } from '../../utils/testing/tokens.js';
import { upsertGoogleAuthenticator } from '../../utils/auth/google.js';
import { hasAuthenticator } from '../../utils/auth/authenticators.js';
import { mockTime, advanceTime } from '../../utils/testing/time.js';
import { User } from '../../models/index.js';

describe('/1/auth/google', () => {
  describe('POST /', () => {
    it('should sign up a new user', async () => {
      const email = 'foo@bar.com';

      const code = createCode({
        email,
        given_name: 'Frank',
        family_name: 'Reynolds',
      });

      const response = await request('POST', '/1/auth/google', {
        code,
      });
      expect(response).toHaveStatus(200);
      expect(response.body.data.result).toBe('signup');

      const user = await User.findOne({
        email,
      });

      assertAuthToken(user, response.body.data.token);
      expect(user.email).toBe(email);
    });

    it('should verify a token for an existing user', async () => {
      mockTime('2020-01-01');

      let user = await createUser({
        email: 'foo@bar.com',
        authenticators: [
          {
            type: 'google',
          },
        ],
      });
      const code = createCode({
        email: 'foo@bar.com',
      });
      advanceTime(1000);

      const response = await request('POST', '/1/auth/google', {
        code,
      });
      expect(response).toHaveStatus(200);
      assertAuthToken(user, response.body.data.token);
      expect(response.body.data.result).toBe('login');

      user = await User.findById(user.id);

      const { lastUsedAt } = user.authenticators.find((authenticator) => {
        return authenticator.type === 'google';
      });

      expect(lastUsedAt).toEqual(new Date('2020-01-01T00:00:01.000Z'));
    });

    it('should not be able to register with an unverified email', async () => {
      const code = createCode({
        givenName: 'Bob',
        familyName: 'Johnson',
        email: 'foo@bar.com',
        email_verified: false,
      });
      const response = await request('POST', '/1/auth/google', {
        firstName: 'Frank',
        lastName: 'Reynolds',
        code,
      });
      expect(response).toHaveStatus(400);
    });

    it('should add authenticator if none', async () => {
      mockTime('2020-01-01');

      let user = await createUser({
        email: 'foo@bar.com',
      });
      const code = createCode({
        email: 'foo@bar.com',
      });
      const response = await request('POST', '/1/auth/google', {
        code,
      });

      expect(response).toHaveStatus(200);
      user = await User.findById(user.id);
      expect(user.authenticators).toMatchObject([
        {
          type: 'google',
          createdAt: new Date('2020-01-01'),
        },
      ]);
    });

    it('should not add multiple authenticators', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      const code = createCode({
        email: 'foo@bar.com',
      });

      await request('POST', '/1/auth/google', {
        code,
      });

      await request('POST', '/1/auth/google', {
        code,
      });

      user = await User.findById(user.id);
      expect(user.authenticators.length).toBe(1);
    });

    it('should throw an error on a bad token', async () => {
      const response = await request('POST', '/1/auth/google', {
        token: 'bad',
      });
      expect(response).toHaveStatus(400);
    });
  });

  describe('POST /disable', () => {
    it('should remove authenticator', async () => {
      let user = await createUser({
        email: 'foo@bar.com',
      });
      upsertGoogleAuthenticator(user);
      await user.save();

      const response = await request(
        'POST',
        '/1/auth/google/disable',
        {},
        {
          user,
        },
      );
      expect(response).toHaveStatus(200);
      expect(response.body.data.id).toBe(user.id);

      user = await User.findById(user.id);
      expect(hasAuthenticator(user, 'google')).toBe(false);
    });
  });
});
