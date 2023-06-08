const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');

const { validateToken } = require('../tokens');

const { context } = require('../../testing');

describe('validateToken', () => {
  it('should trigger an error if jwt token can not be found', async () => {
    const middleware = validateToken();
    let ctx;
    ctx = context({ headers: { notAuthorization: 'Bearer $token' } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'no jwt token found in request');

    ctx = context({ headers: { authorization: 'not Bearer $token' } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'no jwt token found in request');
  });

  it('should trigger an error if token is bad', async () => {
    const middleware = validateToken();
    let ctx;
    ctx = context({ headers: { authorization: 'Bearer badToken' } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'bad jwt token');
    ctx = context({});
  });

  it('should confirm that token has a valid kid', async () => {
    const middleware = validateToken();
    const token = jwt.sign({ kid: 'not valid kid' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'jwt token does not match supported kid');
  });

  it('should confirm that type if specify in middleware', async () => {
    const middleware = validateToken({
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
    const middleware = validateToken();
    const token = jwt.sign({ kid: 'user' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'invalid signature');
  });

  it('should fail if expired', async () => {
    const middleware = validateToken();
    const token = jwt.sign({ kid: 'user' }, config.get('JWT_SECRET'), { expiresIn: 0 });
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'jwt expired');
  });

  it('should work with valid secret and not expired', async () => {
    const middleware = validateToken();
    const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await middleware(ctx, () => {
      expect(ctx.state.jwt.attribute).toBe('value');
    });
  });

  it('should only validate the token once when called multiple times', async () => {
    const middleware = validateToken();
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

  describe('optional validation', () => {
    it('should validateToken when token exists', async () => {
      const middleware = validateToken({ optional: true });
      const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
      const ctx = context({ headers: { authorization: `Bearer ${token}` } });
      await middleware(ctx, () => {
        expect(ctx.state.jwt.attribute).toBe('value');
      });
    });

    it('should not error when no token exists', async () => {
      const middleware = validateToken({ optional: true });
      const ctx = context();
      await middleware(ctx, () => {
        expect(ctx.state.jwt).toBeUndefined();
      });
    });

    it('should allow chaining of optional and required', async () => {
      const optional = validateToken({ optional: true });
      const required = validateToken();

      const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
      const ctx = context({ headers: { authorization: `Bearer ${token}` } });

      await optional(ctx, () => {});
      await required(ctx, () => {});
      expect(ctx.state.jwt.attribute).toBe('value');
    });

    it('should throw after optional when required and no token', async () => {
      const optional = validateToken({ optional: true });
      const required = validateToken();

      const ctx = context();

      await optional(ctx, () => {});
      expect(ctx.state.jwt).toBeUndefined();

      await expect(required(ctx)).rejects.toHaveProperty('message', 'no jwt token found in request');
    });
  });
});
