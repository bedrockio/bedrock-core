const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Product } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('productId', async (id, ctx, next) => {
    const product = await Product.findById(id);
    ctx.state.product = product;
    if (!product) {
      ctx.throw(404);
    }
    return next();
  })
  .post('/', validateBody(Product.getCreateValidation()), async (ctx) => {
    const product = await Product.create(ctx.request.body);
    ctx.body = {
      data: product,
    };
  })
  .get('/:productId', async (ctx) => {
    const { product } = await ctx.state;
    ctx.body = {
      data: product,
    };
  })
  .post(
    '/search',
    validateBody(
      Product.getSearchValidation(),
    ),
    async (ctx) => {
      const { data, meta } = await Product.search(ctx.request.body);
      ctx.body = {
        data,
        meta,
      };
    }
  )
  .patch('/:productId', validateBody(Product.getUpdateValidation()), async (ctx) => {
    const product = ctx.state.product;
    product.assign(ctx.request.body);
    await product.save();
    ctx.body = {
      data: product,
    };
  })
  .delete('/:productId', async (ctx) => {
    const product = ctx.state.product;
    await product.delete();
    ctx.status = 204;
  });

module.exports = router;
