const { authenticate, fetchUser } = require('../authenticate');
const { createAuthToken, generateTokenId } = require('../../tokens');
const { setupDb, teardownDb, context, createUser } = require('../../testing');
const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');

describe('authenticate', () => {
  it('should trigger an error if jwt token can not be found', async () => {
    const middleware = authenticate();
    let ctx;
    ctx = context({ headers: { notAuthorization: 'Bearer $token' } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'no jwt token found in request');

    ctx = context({ headers: { authorization: 'not Bearer $token' } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'no jwt token found in request');
  });

  it('should trigger an error if token is bad', async () => {
    const middleware = authenticate();
    let ctx;
    ctx = context({ headers: { authorization: 'Bearer badToken' } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'bad jwt token');
    ctx = context({});
  });

  it('should confirm that token has a valid kid', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'not valid kid' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'jwt token does not match supported kid');
  });

  it('should confirm that type if specify in middleware', async () => {
    const middleware = authenticate({
      type: 'sometype',
    });

    const token = jwt.sign({ kid: 'user', type: 'not same type' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      'endpoint requires jwt token payload match type "sometype"'
    );
  });

  it('should fail if token doesnt have right signature', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'invalid signature');
  });

  it('should fail if expired', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user' }, config.get('JWT_SECRET'), { expiresIn: 0 });
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'jwt expired');
  });

  it('should work with valid secret and not expired', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await middleware(ctx, () => {
      expect(ctx.state.jwt.attribute).toBe('value');
    });
  });

  it('should only validate the token once when called multiple times', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });

    let tmp;
    let count = 0;
    ctx.state = {
      get jwt() {
        return tmp;
      },
      set jwt(value) {
        tmp = value;
        count++;
      },
    };
    await middleware(ctx, () => {});
    await middleware(ctx, () => {});
    expect(ctx.state.jwt.attribute).toBe('value');
    expect(count).toBe(1);
  });

  describe('optional authentication', () => {
    it('should authenticate when token exists', async () => {
      const middleware = authenticate({ optional: true });
      const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
      const ctx = context({ headers: { authorization: `Bearer ${token}` } });
      await middleware(ctx, () => {
        expect(ctx.state.jwt.attribute).toBe('value');
      });
    });

    it('should not error when no token exists', async () => {
      const middleware = authenticate({ optional: true });
      const ctx = context();
      await middleware(ctx, () => {
        expect(ctx.state.jwt).toBeUndefined();
      });
    });

    it('should allow chaining of optional and required', async () => {
      const optional = authenticate({ optional: true });
      const required = authenticate();

      const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
      const ctx = context({ headers: { authorization: `Bearer ${token}` } });

      await optional(ctx, () => {});
      await required(ctx, () => {});
      expect(ctx.state.jwt.attribute).toBe('value');
    });

    it('should throw after optional when required and no token', async () => {
      const optional = authenticate({ optional: true });
      const required = authenticate();

      const ctx = context();

      await optional(ctx, () => {});
      expect(ctx.state.jwt).toBeUndefined();

      await expect(required(ctx)).rejects.toHaveProperty('message', 'no jwt token found in request');
    });
  });
});

describe('fetchUser', () => {
  beforeAll(async () => {
    await setupDb();
  });

  afterAll(async () => {
    await teardownDb();
  });

  it('should fetch the authUser', async () => {
    const user = await createUser();
    const ctx = context();
    ctx.state.jwt = { sub: user.id };
    await fetchUser(ctx, () => {
      expect(ctx.state.authUser.id).toBe(user.id);
    });
  });

  it('should not fail without jwt token', async () => {
    const ctx = context();
    await fetchUser(ctx, () => {
      expect(ctx.state.authUser).toBeUndefined();
    });
  });

  it('should not fetch the user twice when called with the same context', async () => {
    const user = await createUser();
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
      jwt: { sub: user.id },
    };
    await fetchUser(ctx, () => {});
    await fetchUser(ctx, () => {});
    expect(count).toBe(1);
  });
});

describe('token interop', () => {
  beforeAll(async () => {
    await setupDb();
  });

  afterAll(async () => {
    await teardownDb();
  });

  async function generateAuthToken(user) {
    const tokenId = generateTokenId();
    await user.updateOne({
      authTokenId: tokenId,
    });
    return await createAuthToken(user.id, tokenId);
  }

  it('should not be able to replay a previous token', async () => {
    let ctx;
    const user = await createUser();

    // Generate new token for user and authorize
    const token1 = await generateAuthToken(user);
    ctx = context({ headers: { authorization: `Bearer ${token1}` } });
    await authenticate()(ctx, () => {});
    await fetchUser(ctx, () => {});
    expect(ctx.state.authUser.id).toBe(user.id);

    // Generate another token for user and authorize
    const token2 = await generateAuthToken(user);
    ctx = context({ headers: { authorization: `Bearer ${token2}` } });
    await authenticate()(ctx, () => {});
    await fetchUser(ctx, () => {});
    expect(ctx.state.authUser.id).toBe(user.id);

    // Attempt to authorize with first token
    ctx = context({ headers: { authorization: `Bearer ${token1}` } });
    await authenticate()(ctx, () => {});
    await expect(fetchUser(ctx, () => {})).rejects.toHaveProperty(
      'message',
      'user associated to token could not be found'
    );
  });
});
