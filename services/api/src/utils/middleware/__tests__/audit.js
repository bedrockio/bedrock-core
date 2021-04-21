const audit = require('../audit');

const { Product } = require('../../../models');
const { loggingMiddleware } = require('@bedrockio/instrumentation');
const Koa = require('koa');
const Router = require('@koa/router');
const mongoose = require('mongoose');
const { authenticate, fetchUser } = require('../authenticate');

const { AuditHistory } = audit;

const { setupDb, teardownDb, createUser, request } = require('../../testing');
const bodyParser = require('koa-body');

const app = new Koa();
const router = new Router();

app.use(loggingMiddleware()).use(bodyParser({ multipart: true }));

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .use(audit.setup())
  .post('create', '/products', async (ctx) => {
    const product = await Product.create({
      name: 'test 1',
      description: 'Some description',
      shop: mongoose.Types.ObjectId(),
    });
    audit.setObject(ctx, product);
    ctx.status = 204;
  })
  .get('query', '/products', async (ctx) => {
    ctx.status = 204;
  })
  .post('query', '/products/search', (ctx) => {
    ctx.status = 204;
  })
  .param('product', async (id, ctx, next) => {
    const product = await Product.findById(id);
    ctx.state.product = product;
    audit.setObject(ctx, product);
    return next();
  })
  .get('lookup', '/products/:product', (ctx) => {
    ctx.status = 204;
  })
  .patch('update', '/products/:product', (ctx) => {
    ctx.status = 204;
  })
  .del('delete', '/products/:product', (ctx) => {
    ctx.status = 204;
  });

app.use(router.routes());

describe('audit', () => {
  beforeAll(async () => {
    await setupDb();
  });

  afterAll(async () => {
    await teardownDb();
  });

  beforeEach(async () => {
    await AuditHistory.deleteMany({});
  });

  describe('audit.setup', () => {
    describe('should capture basic CRUD:', () => {
      it('GET /:product', async () => {
        const user = await createUser();
        const product = await Product.create({
          name: 'test 1',
          description: 'Some description',
          shop: mongoose.Types.ObjectId(),
        });

        const response = await request('GET', `/products/${product.id}`, {}, { user, app });
        expect(response.status).toBe(204);

        const history = await AuditHistory.find();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('lookup');
        expect(history[0].collectionName).toBe('products');
        expect(history[0].userId.toString()).toBe(user.id);
        expect(history[0].objectId.toString()).toBe(product.id);
        expect(history[0].requestQuery).toBe(undefined);
        expect(history[0].requestBody).toBe(undefined);
        expect(history[0].requestUrl).toBe(`/products/${product.id}`);
        expect(history[0].requestMethod).toBe('GET');
      });

      it('GET /', async () => {
        const user = await createUser();

        const response = await request('GET', `/products`, { sort: 'createdAt' }, { user, app });
        expect(response.status).toBe(204);

        const history = await AuditHistory.find();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('query');
        expect(history[0].collectionName).toBe(undefined);
        expect(history[0].userId.toString()).toBe(user.id);
        expect(history[0].objectId).toBe(undefined);
        expect(history[0].requestQuery.sort).toBe('createdAt');
        expect(history[0].requestBody).toBe();
        expect(history[0].requestUrl).toBe(`/products`);
        expect(history[0].requestMethod).toBe('GET');
      });

      it('POST /search', async () => {
        const user = await createUser();

        const response = await request('POST', `/products/search`, { sort: 'createdAt' }, { user, app });
        expect(response.status).toBe(204);

        const history = await AuditHistory.find();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('query');
        expect(history[0].collectionName).toBe(undefined);
        expect(history[0].userId.toString()).toBe(user.id);
        expect(history[0].objectId).toBe(undefined);
        expect(history[0].requestQuery).toBe(undefined);
        expect(history[0].requestBody.sort).toBe('createdAt');
        expect(history[0].requestUrl).toBe(`/products/search`);
        expect(history[0].requestMethod).toBe('POST');
      });

      it('PATCH /:product', async () => {
        const user = await createUser();

        const product = await Product.create({
          name: 'test 1',
          description: 'Some description',
          shop: mongoose.Types.ObjectId(),
        });

        const response = await request('PATCH', `/products/${product.id}`, { name: 'test 2' }, { user, app });
        expect(response.status).toBe(204);

        const history = await AuditHistory.find();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('update');
        expect(history[0].collectionName).toBe('products');
        expect(history[0].userId.toString()).toBe(user.id);
        expect(history[0].objectId.toString()).toBe(product.id);
        expect(history[0].requestQuery).toBe(undefined);
        expect(history[0].requestBody.name).toBe('test 2');
        expect(history[0].requestUrl).toBe(`/products/${product.id}`);
        expect(history[0].requestMethod).toBe('PATCH');
      });

      it('DEL /:product', async () => {
        const user = await createUser();

        const product = await Product.create({
          name: 'test 1',
          description: 'Some description',
          shop: mongoose.Types.ObjectId(),
        });

        const response = await request('DELETE', `/products/${product.id}`, {}, { user, app });
        expect(response.status).toBe(204);

        const history = await AuditHistory.find();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('delete');
        expect(history[0].collectionName).toBe('products');
        expect(history[0].userId.toString()).toBe(user.id);
        expect(history[0].objectId.toString()).toBe(product.id);
        expect(history[0].requestQuery).toBe(undefined);
        expect(history[0].requestBody).toBe(undefined);
        expect(history[0].requestUrl).toBe(`/products/${product.id}`);
        expect(history[0].requestMethod).toBe('DELETE');
      });

      it('POST /', async () => {
        const user = await createUser();
        const response = await request('POST', `/products`, { name: 'test 2' }, { user, app });
        expect(response.status).toBe(204);

        const history = await AuditHistory.find();
        expect(history.length).toBe(1);
        expect(history[0].action).toBe('create');
        expect(history[0].collectionName).toBe('products');
        expect(history[0].userId.toString()).toBe(user.id);
        expect(history[0].objectId.toString()).toBeDefined();
        expect(history[0].requestQuery).toBe(undefined);
        expect(history[0].requestBody.name).toBe('test 2');
        expect(history[0].requestUrl).toBe(`/products`);
        expect(history[0].requestMethod).toBe('POST');
      });
    });
  });
});
