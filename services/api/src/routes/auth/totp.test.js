const speakeasy = require('speakeasy');
const { request, createUser } = require('../../utils/testing');
const { assertAuthToken } = require('../../utils/testing/tokens');
const { mockTime, unmockTime, advanceTime } = require('../../utils/testing/time');
const { createSecret, enableTotp } = require('../../utils/auth/totp');
const { User } = require('../../models');

describe('/1/auth/totp', () => {
  describe('POST /login', () => {
    it('should verify a code', async () => {
      mockTime('2020-01-01T00:00:00.000Z');

      let user = await createUser();

      const secret = createSecret();
      enableTotp(user, secret);
      await user.save();

      const code = speakeasy.totp({
        secret,
      });

      advanceTime(1000);

      const response = await request(
        'POST',
        '/1/auth/totp/login',
        {
          email: user.email,
          code,
        },
        {
          user,
        },
      );
      expect(response.status).toBe(200);
      assertAuthToken(user, response.body.data.token);

      user = await User.findById(user.id);
      expect(user.authenticators.toObject()).toMatchObject([
        {
          type: 'totp',
          lastUsedAt: new Date('2020-01-01T00:00:01.000Z'),
        },
      ]);

      unmockTime();
    });

    it('should throttle logins', async () => {
      mockTime('2020-01-01');
      let response;
      let code;

      const user = await createUser({
        loginAttempts: 5,
        lastLoginAttemptAt: new Date(),
      });
      const secret = createSecret();
      enableTotp(user, secret);
      await user.save();

      response = await request('POST', '/1/auth/totp/login', {
        email: user.email,
        code: '000000',
      });
      expect(response.status).toBe(401);

      code = speakeasy.totp({
        secret,
      });
      response = await request('POST', '/1/auth/totp/login', {
        email: user.email,
        code,
      });
      expect(response.status).toBe(401);

      advanceTime(60 * 1000);
      code = speakeasy.totp({
        secret,
      });
      response = await request('POST', '/1/auth/totp/login', {
        email: user.email,
        code,
      });
      expect(response.status).toBe(200);

      unmockTime();
    });
  });

  describe('POST /request', () => {
    it('should request a totp authenticator', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/auth/totp/request',
        {},
        {
          user,
        },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.url.startsWith('otpauth://')).toBe(true);
    });

    it('should request authentication', async () => {
      const response = await request('POST', '/1/auth/totp/request', {}, {});
      expect(response.status).toBe(401);
    });
  });

  describe('POST /enable', () => {
    it('should enable a totp authenticator', async () => {
      mockTime('2020-01-01');

      let user = await createUser();
      const secret = createSecret();
      const code = speakeasy.totp({
        secret,
      });

      const response = await request(
        'POST',
        '/1/auth/totp/enable',
        {
          code,
          secret,
        },
        {
          user,
        },
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.authenticators.toObject()).toMatchObject([
        {
          type: 'totp',
          secret,
          createdAt: new Date('2020-01-01'),
        },
      ]);

      unmockTime();
    });

    it('should request authentication', async () => {
      const response = await request('POST', '/1/auth/totp/enable', {}, {});
      expect(response.status).toBe(401);
    });
  });

  describe('POST /disable', () => {
    it('should disable a totp authenticator', async () => {
      let user = await createUser();
      const secret = createSecret();
      enableTotp(user, secret);
      await user.save();

      const response = await request(
        'POST',
        '/1/auth/totp/disable',
        {},
        {
          user,
        },
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.mfaMethod).toBe('none');
      expect(user.authenticators).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'totp',
            secret,
          }),
        ]),
      );
    });

    it('should request authentication', async () => {
      const response = await request('POST', '/1/auth/totp/disable', {}, {});
      expect(response.status).toBe(401);
    });
  });
});
