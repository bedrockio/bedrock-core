import { authenticate, fetchUser } from '../authenticate';
import { setupDb, teardownDb, context, createUser } from '../../test-helpers';
import jwt from 'jsonwebtoken';
import * as config from '@bedrockio/config';

const emptyNext = () => {};

describe('authenticate', () => {

  it('should trigger an error if jwt token can not be found', async () => {
    const middleware = authenticate();
    let ctx;
    ctx = context({ headers: { notAuthorization: 'Bearer $token' } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty('message', 'no jwt token found in request');

    ctx = context({ headers: { authorization: 'not Bearer $token' } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty('message', 'no jwt token found in request');

  });

  it('should trigger an error if token is bad', async () => {
    const middleware = authenticate();
    let ctx;
    ctx = context({ headers: { authorization: 'Bearer badToken' } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty('message', 'bad jwt token');
    ctx = context({});

  });

  it('should confirm that token has a valid kid', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'not valid kid' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty('message', 'jwt token does not match supported kid');
  });

  it('should confirm that type if specify in middleware', async () => {
    const middleware = authenticate({
      type: 'sometype',
    });

    const token = jwt.sign({ kid: 'user', type: 'not same type' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty(
      'message',
      'endpoint requires jwt token payload match type "sometype"'
    );
  });

  it('should fail if token doesnt have right signature', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user' }, 'verysecret');
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty('message', 'invalid signature');
  });

  it('should fail if expired', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user' }, config.get('JWT_SECRET'), { expiresIn: 0 });
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await expect(middleware(ctx, emptyNext)).rejects.toHaveProperty('message', 'jwt expired');
  });

  it('it should work with valid secret and not expired', async () => {
    const middleware = authenticate();
    const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
    const ctx = context({ headers: { authorization: `Bearer ${token}` } });
    await middleware(ctx, () => {
      expect(ctx.state.jwt.attribute).toBe('value');
    });
  });

  it('it should only validate the token once when called multiple times', async () => {
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

    it('it should authenticate when token exists', async () => {
      const middleware = authenticate({ optional: true });
      const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
      const ctx = context({ headers: { authorization: `Bearer ${token}` } });
      await middleware(ctx, () => {
        expect(ctx.state.jwt.attribute).toBe('value');
      });
    });

    it('it should not error when no token exists', async () => {
      const middleware = authenticate({ optional: true });
      const ctx = context();
      await middleware(ctx, () => {
        expect(ctx.state.jwt).toBeUndefined();
      });
    });

    it('it should allow chaining of optional and required', async () => {
      const optional = authenticate({ optional: true });
      const required = authenticate();

      const token = jwt.sign({ kid: 'user', attribute: 'value' }, config.get('JWT_SECRET'));
      const ctx = context({ headers: { authorization: `Bearer ${token}` } });

      await optional(ctx, () => {});
      await required(ctx, () => {});
      expect(ctx.state.jwt.attribute).toBe('value');
    });

    it('it should throw after optional when required and no token', async () => {
      const optional = authenticate({ optional: true });
      const required = authenticate();

      const ctx = context();

      await optional(ctx, () => {});
      expect(ctx.state.jwt).toBeUndefined();

      await expect(required(ctx, emptyNext)).rejects.toHaveProperty('message', 'no jwt token found in request');
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

  it('it should fetch the authUser', async () => {
    const user = await createUser();
    const ctx = context();
    ctx.state.jwt = { userId: user.id };
    await fetchUser(ctx, () => {
      expect(ctx.state.authUser.id).toBe(user.id);
    });
  });

  it('it should not fail without jwt token', async () => {
    const user = await createUser();
    const ctx = context();
    await fetchUser(ctx, () => {
      expect(ctx.state.authUser).toBeUndefined();
    });
  });

  it('it should not fetch the user twice when called with the same context', async () => {
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
      jwt: { userId: user.id }
    };
    await fetchUser(ctx, () => {});
    await fetchUser(ctx, () => {});
    expect(count).toBe(1);
  });

});
