const Router = require('@koa/router');
const Joi = require('joi');
const validate = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { searchValidation, getSearchQuery, search } = require('../utils/search');
const Audit = require('../utils/audit');

const { NotFoundError } = require('../utils/errors');
const { Product } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('productId', async (id, ctx, next) => {
    const product = await Product.findById(id);
    ctx.state.product = product;
    if (!product) {
      throw new NotFoundError();
    }
    return next();
  })
  .post(
    '/',
    validate({
      body: Product.getCreateValidation(),
    }),
    async (ctx) => {
      const product = await Product.create(ctx.request.body);
      await Audit.create(ctx, 'create product', product.id, { name: product.name });
      ctx.body = {
        data: product,
      };
    }
  )
  .get('/:productId', async (ctx) => {
    const { product } = await ctx.state;
    await Audit.read(ctx, 'view product', product.id);
    ctx.body = {
      data: product,
    };
  })
  .post(
    '/search',
    validate({
      body: Joi.object({
        name: Joi.string(),
        shop: Joi.string(),
        ...searchValidation(),
      }),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const { shop } = body;
      const query = getSearchQuery(body, {
        keywordFields: ['name'],
      });
      if (shop) {
        query.shop = shop;
      }
      const { data, meta } = await search(Product, query, body);

      // XXX What todo here?
      // 1. No object should we track create a db record for each ObjectId return from the query
      // 2. Change the db model
      // 3. No nothing just store a action string
      await Audit.read(ctx, 'searched products');
      ctx.body = {
        data,
        meta,
      };
    }
  )
  .patch(
    '/:productId',
    validate({
      body: Product.getUpdateValidation(),
    }),
    async (ctx) => {
      const product = ctx.state.product;
      product.assign(ctx.request.body);
      const diffObject = Audit.getDiffObject(product, ['name', 'priceUsd']);
      await product.save();
      await Audit.update(ctx, 'update product', product.id, diffObject);
      ctx.body = {
        data: product,
      };
    }
  )
  .delete('/:productId', async (ctx) => {
    const product = ctx.state.product;
    await product.delete();
    await Audit.delete(ctx, 'delete product', product.id);
    ctx.status = 204;
  });

module.exports = router;
