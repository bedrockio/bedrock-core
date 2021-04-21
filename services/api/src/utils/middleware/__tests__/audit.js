const audit = require('../audit');

const { Product } = require('../../../models');
const Koa = require('koa');
const Router = require('@koa/router');

const { setupDb, teardownDb, createUser, request } = require('../../testing');

describe('audit', () => {
  beforeAll(async () => {
    await setupDb();
  });

  afterAll(async () => {
    await teardownDb();
  });
});

const app = new Koa();
const router = new Router();

router
  .use(audit())

  .post('create', '/products', async (ctx) => {})
  .get('list', '/products', async (ctx) => {})
  .search('list', '/products', async (ctx) => {})
  .param('productId', async (id, ctx, next) => {
    const product = await Product.findById(id);
    ctx.state.product = product;
    audit.setObject(ctx, product);
    return next();
  })
  .get('get', '/products/:product', async () => {});

app.use(router.routes());

describe('audit.setup', () => {
  it('should capture basic CRUD: GET', async () => {
    const user = await createUser();
    const product = await Product.create({});

    await request('GET', `/1/products/${product.id}`, {}, { user, app });

    const history = await audit.AuditHistory.find({ collectionName: 'products', objectId: product.id });
    console.log(history);
    expect(history.length).toBe(1);
  });
});
