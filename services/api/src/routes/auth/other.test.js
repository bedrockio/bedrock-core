const { request, createUser, createAdmin } = require('../../utils/testing');
const { User } = require('../../models');

describe('/1/auth', () => {
  describe('POST /logout', () => {
    it('should remove all tokens', async () => {
      const user = await createUser({
        authTokens: [
          {
            jti: 'someid',
            ip: '123.12.1.2',
            expiresAt: new Date(Date.now() + 10000),
            lastUsedAt: new Date(),
          },
        ],
      });

      const response = await request('POST', '/1/auth/logout', { all: true }, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authTokens).toHaveLength(0);
    });

    it('should remove current session if nothing is set', async () => {
      const user = await createUser({
        authTokens: [
          {
            jti: 'old session not expired',
            ip: '123',
            expiresAt: new Date(Date.now() + 5000),
            lastUsedAt: new Date(Date.now() - 1000),
          },
        ],
      });
      const response = await request('POST', '/1/auth/logout', {}, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authTokens).toHaveLength(1);
      expect(updatedUser.authTokens[0].jti).toBe('old session not expired');
    });

    it('should remove token by jti', async () => {
      const user = await createUser({
        authTokens: [
          {
            jti: 'someid',
            ip: '123.12.1.2',
            iat: new Date(),
            expiresAt: new Date(Date.now() + 10000),
            lastUsedAt: new Date(),
          },
          {
            jti: 'otherid',
            iat: '123',
            ip: '123',
            expiresAt: new Date(Date.now() + 5000),
            lastUsedAt: new Date(Date.now() - 1000),
          },
        ],
      });
      const response = await request('POST', '/1/auth/logout', { jti: 'otherid' }, { user });
      expect(response.status).toBe(204);
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.authTokens).toHaveLength(1);
      expect(updatedUser.authTokens[0].jti).toBe('someid');
    });
  });

  describe('PATCH /mfa-method', () => {
    it('should set sms for user with phone number', async () => {
      let user = await createUser({
        phone: '+12223456789',
      });
      const response = await request(
        'PATCH',
        '/1/auth/mfa-method',
        {
          method: 'sms',
        },
        { user },
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.mfaMethod).toBe('sms');
    });

    it('should set email for user with email', async () => {
      let user = await createUser();
      const response = await request(
        'PATCH',
        '/1/auth/mfa-method',
        {
          method: 'email',
        },
        { user },
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.mfaMethod).toBe('email');
    });

    it('should set to none', async () => {
      let user = await createUser({
        mfaMethod: 'sms',
      });
      const response = await request(
        'PATCH',
        '/1/auth/mfa-method',
        {
          method: 'none',
        },
        { user },
      );
      expect(response.status).toBe(200);

      user = await User.findById(user.id);
      expect(user.mfaMethod).toBe('none');
    });

    it('should not set sms for user with no phone number', async () => {
      let user = await createUser();
      const response = await request(
        'PATCH',
        '/1/auth/mfa-method',
        {
          method: 'sms',
        },
        { user },
      );
      expect(response.status).toBe(400);
    });

    it('should expand user roles', async () => {
      const user = await createAdmin();
      const response = await request(
        'PATCH',
        '/1/auth/mfa-method',
        {
          method: 'email',
        },
        { user },
      );
      expect(response.body.data.roles[0].roleDefinition.name).toBe('Admin');
    });
  });
});
