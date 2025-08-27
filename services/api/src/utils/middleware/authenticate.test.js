const { authenticate, authorizeUser } = require('./authenticate');
const { getAuthPayload, signToken } = require('../tokens');

const { context, createUser } = require('../testing');
const { User } = require('../../models');

describe('authenticate', () => {
  it('should authenticate the user with bearer', async () => {
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

    const payload = getAuthPayload(user);
    const token = signToken(payload);

    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await authenticate()(ctx, () => {
      expect(ctx.state.authUser.id).toBe(user.id);
    });
  });

  it('should not fail on optional authentication with no token', async () => {
    const ctx = context();
    const middleware = authenticate({ optional: true });
    await expect(middleware(ctx, () => {})).resolves.not.toThrow();
  });
});

describe('authorizeUser', () => {
  it('should fetch the authUser', async () => {
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

    const ctx = context({});
    ctx.state.jwt = { sub: user.id, jti: 'someid' };
    await authorizeUser()(ctx, () => {
      expect(ctx.state.authUser.id).toBe(user.id);
    });
  });

  it('should not fail without jwt token', async () => {
    const ctx = context();
    await expect(authorizeUser()(ctx, () => {})).resolves.not.toThrow();
  });

  it('should not fetch the user twice when called with the same context', async () => {
    const user = await createUser({
      authTokens: [
        {
          jti: 'jti-id',
          ip: '123.12.1.2',
          expiresAt: new Date(Date.now() + 10000),
          lastUsedAt: new Date(),
        },
      ],
    });
    const ctx = context();
    let tmp;
    let count = 0;
    ctx.state = {
      get authUser() {
        return tmp;
      },
      set authUser(user) {
        tmp = user;
        count++;
      },
      jwt: { sub: user.id, jti: 'jti-id' },
    };
    await authorizeUser()(ctx, () => {});
    expect(count).toBe(1);
  });

  it('should update user ip and lastUsedAt', async () => {
    const user = await createUser({
      authTokens: [
        {
          kid: 'user',
          jti: 'jti-id',
          ip: '123.12.1.2',
          expiresAt: new Date(Date.now() + 10000),
          lastUsedAt: new Date(0),
        },
      ],
    });
    const ctx = context({
      headers: {
        'x-forwarded-for': '11.11.1.1',
      },
    });
    ctx.state = {
      jwt: {
        kid: 'user',
        sub: user.id,
        jti: 'jti-id',
      },
    };

    await authorizeUser()(ctx, () => {});
    const dbUser = await User.findById(user.id);
    expect(dbUser.authTokens[0].ip).toBe('11.11.1.1');
    expect(dbUser.authTokens[0].lastUsedAt.valueOf()).not.toEqual(0);
    expect(dbUser.authTokens).toHaveLength(1);
  });

  it('should NOT update user`s ip if it was recently updated', async () => {
    const user = await createUser({
      authTokens: [
        {
          jti: 'jti-id',
          ip: '123.12.1.2',
          expiresAt: new Date(Date.now() + 10000),
          lastUsedAt: new Date(),
        },
      ],
    });
    const ctx = context({
      headers: {
        'x-forwarded-for': '123.12.1.2',
      },
    });
    ctx.state = {
      jwt: { sub: user.id, jti: 'jti-id' },
    };

    await authorizeUser()(ctx, () => {});
    const dbUser = await User.findById(user.id);
    expect(dbUser.authTokens[0].ip).toBe('123.12.1.2');
    expect(dbUser.authTokens).toHaveLength(1);
  });
});
