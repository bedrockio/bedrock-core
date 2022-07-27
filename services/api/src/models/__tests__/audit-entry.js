const mongoose = require('mongoose');
const AuditEntry = require('../audit-entry');
const User = require('../user');

const Koa = require('koa');
const Router = require('@koa/router');
const request = require('supertest');
const { createSchema } = require('../../utils/schema');

const { setupDb, teardownDb, createUser } = require('../../utils/testing');

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

describe('AuditEntry', () => {
  describe('getObjectFields', () => {
    it('should return a diff object (new object)', async () => {
      const user = await createUser({
        email: 'bob@new.com',
      });
      await user.save();
      const fields = AuditEntry.getObjectFields(user, ['email']);
      expect(fields.objectId).toBe(user.id);
      expect(fields.objectType).toBe('User');
      expect(fields.objectAfter.email).toBe('bob@new.com');
      expect(fields.objectBefore).not.toBeDefined();
    });

    it('should return a diff object for objectId (new object)', async () => {
      const user = await createUser({
        us: 'bob@new.com',
      });

      const schema = createSchema({
        attributes: {
          user: {
            ref: 'User',
            type: 'ObjectId',
          },
        },
      });

      const NewModel = mongoose.model('NewModel', schema);

      const newModel = await NewModel.create({
        user: user.id,
      });

      const fields = AuditEntry.getObjectFields(newModel, ['user']);

      expect(fields.objectId).toBe(newModel.id);
      expect(fields.objectType).toBe('NewModel');
      expect(fields.objectAfter.user.toString()).toBe(user.id.toString());
      expect(fields.objectBefore).not.toBeDefined();
    });

    it('should return a diff object (old object)', async () => {
      const user = await createUser({
        email: 'hugo@old.com',
      });
      const dbUser = await User.findById(user.id);
      dbUser.email = 'hugo@new.com';
      await dbUser.save();
      const fields = AuditEntry.getObjectFields(dbUser, ['email']);
      expect(fields.objectId).toBe(dbUser.id);
      expect(fields.objectType).toBe('User');
      expect(fields.objectBefore.email).toBe('hugo@old.com');
      expect(fields.objectAfter.email).toBe('hugo@new.com');
    });
  });

  describe('getContextFields', () => {
    it('should extract fields from ctx', async () => {
      const user = new User({});
      const ctx = await getContext(user);

      expect(AuditEntry.getContextFields(ctx)).toEqual(
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

      await AuditEntry.append('did something', ctx, {
        type: 'security',
        objectId: user.id,
        objectType: 'user',
      });

      const logs = await AuditEntry.find({ objectId: user.id });
      expect(logs.length).toBe(1);

      const log = logs[0];
      expect(log.type).toBe('security');
      expect(log.activity).toBe('did something');
      expect(log.objectId.toString()).toBe(user.id);
      expect(log.objectType).toBe('user');
      expect(log.requestMethod).toBe('GET');
      expect(log.requestUrl).toBe('/1/products/id');
      expect(log.routeNormalizedPath).toBe('/1/products/:id');
      expect(log.createdAt).toBeDefined();
      expect(log.user.toString()).toBe(user.id);
    });

    it('should not change, if nothing was changed', async () => {
      const user = new User({ email: 'bob@gmail.com' });
      const ctx = await getContext(user);

      await AuditEntry.append('did something', ctx, {
        type: 'security',
        objectId: user.id,
        objectType: 'user',
        objectAfter: {},
      });

      const logs = await AuditEntry.find({ objectId: user.id });
      expect(logs.length).toBe(0);
    });
  });
});
