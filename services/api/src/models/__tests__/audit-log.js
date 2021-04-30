const AuditLog = require('../audit-log');
const User = require('../user');
const Koa = require('koa');
const Router = require('@koa/router');
const request = require('supertest');

const { setupDb, teardownDb } = require('../../utils/testing');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

async function getContext(user) {
  const app = new Koa();
  const productRouter = new Router({
    prefix: '/1/products',
  });
  let current;

  productRouter.use((ctx, next) => {
    ctx.state.authUser = user;
    return next();
  });
  productRouter.get('/:id', async (ctx) => {
    current = ctx;
  });
  app.use(productRouter.routes());
  await request(app.callback()).get('/1/products/id');

  return current;
}

describe('AuditLog', () => {
  describe('getDiffObject', () => {
    it('should return a diff object', async () => {
      const user = new User({});
      user.email = 'bob@new.com';
      const diffObject = AuditLog.getDiffObject(user, ['email']);

      expect(JSON.stringify(diffObject)).toBe(
        JSON.stringify({
          email: 'bob@new.com',
        })
      );
    });
  });

  describe('getFieldsContext', () => {
    it('should extract fields from ctx', async () => {
      const user = new User({});
      const ctx = await getContext(user);

      expect(AuditLog.getFieldsContext(ctx)).toEqual(
        expect.objectContaining({
          requestMethod: 'GET',
          requestUrl: '/1/products/id',
          routeNormalizedPath: '/1/products/:id',
          routePrefix: '/1/products',
          user: user.id,
        })
      );
    });
  });

  describe('append', () => {
    it('should write to the db', async () => {
      const user = new User({ email: 'bob@gmail.com' });
      const ctx = await getContext(user);

      await AuditLog.append('did something', {
        ctx,
        objectDiff: { email: user.email },
        objectId: user.id,
      });

      const logs = await AuditLog.find({ objectId: user.id });
      expect(logs.length).toBe(1);

      const log = logs[0];
      expect(log.action).toBe('did something');
      expect(log.objectDiff.email).toBe('bob@gmail.com');
      expect(log.objectId.toString()).toBe(user.id);
      expect(log.requestMethod).toBe('GET');
      expect(log.requestUrl).toBe('/1/products/id');
      expect(log.routeNormalizedPath).toBe('/1/products/:id');
      expect(log.user.toString()).toBe(user.id);
    });
  });
});
