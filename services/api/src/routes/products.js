const mongoose = require('mongoose');
const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');

const { exportValidation, csvExport } = require('../utils/csv');
const { Product } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('id', async (id, ctx, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404);
    }
    const product = await Product.findById(id);
    if (!product) {
      ctx.throw(404);
    }
    ctx.state.product = product;
    return next();
  })
  .post('/', validateBody(Product.getCreateValidation()), async (ctx) => {
    const product = await Product.create(ctx.request.body);
    ctx.body = {
      data: product,
    };
  })
  .get('/:id', async (ctx) => {
    const { product } = await ctx.state;
    ctx.body = {
      data: product,
    };
  })
  .post(
    '/search',
    validateBody(
      Product.getSearchValidation({
        ...exportValidation(),
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await Product.search(params);

      if (format === 'csv') {
        return csvExport(ctx, data, { filename });
      }

      ctx.body = {
        data,
        meta,
      };
    }
  )
  .patch('/:id', validateBody(Product.getUpdateValidation()), async (ctx) => {
    const product = ctx.state.product;
    product.assign(ctx.request.body);

    await product.save();

    ctx.body = {
      data: product,
    };
  })
  .delete('/:id', async (ctx) => {
    const product = ctx.state.product;
    await product.delete();
    ctx.status = 204;
  });

module.exports = router;
