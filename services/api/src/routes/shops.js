const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Shop } = require('../models');

const { exportValidation, csvExport } = require('../utils/csv');
const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('shopId', async (id, ctx, next) => {
    try {
      const shop = await Shop.findById(id);
      if (!shop) {
        ctx.throw(404);
      }
      ctx.state.shop = shop;
      return next();
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .post('/', validateBody(Shop.getCreateValidation()), async (ctx) => {
    const shop = await Shop.create(ctx.request.body);
    ctx.body = {
      data: shop,
    };
  })
  .get('/:shopId', async (ctx) => {
    const shop = ctx.state.shop;
    ctx.body = {
      data: shop,
    };
  })
  .post('/search', validateBody(Shop.getSearchValidation({
      ...exportValidation(),
  })), async (ctx) => {
    const { format, filename, ...params } = ctx.request.body;
    const { data, meta } = await Shop.search(params);

    if (format === 'csv') {
      return csvExport(ctx, data, { filename });
    }

    ctx.body = {
      data,
      meta,
    };
  })
  .patch('/:shopId', validateBody(Shop.getUpdateValidation()), async (ctx) => {
    const shop = ctx.state.shop;
    shop.assign(ctx.request.body);
    await shop.save();
    ctx.body = {
      data: shop,
    };
  })
  .delete('/:shopId', async (ctx) => {
    await ctx.state.shop.delete();
    ctx.status = 204;
  });

module.exports = router;
