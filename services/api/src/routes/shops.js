const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Shop } = require('../models');
const { exportValidation, csvExport } = require('../utils/csv');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('id', fetchByParam(Shop))
  .post('/', validateBody(Shop.getCreateValidation()), async (ctx) => {
    const shop = await Shop.create(ctx.request.body);
    ctx.body = {
      data: shop,
    };
  })
  .get('/:id', async (ctx) => {
    const shop = ctx.state.shop;
    ctx.body = {
      data: shop,
    };
  })
  .post(
    '/search',
    validateBody(
      Shop.getSearchValidation({
        ...exportValidation(),
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await Shop.search(params);

      if (format === 'csv') {
        return csvExport(ctx, data, { filename });
      }

      ctx.body = {
        data,
        meta,
      };
    }
  )
  .patch('/:id', validateBody(Shop.getUpdateValidation()), async (ctx) => {
    const shop = ctx.state.shop;
    shop.assign(ctx.request.body);
    await shop.save();
    ctx.body = {
      data: shop,
    };
  })
  .delete('/:id', async (ctx) => {
    await ctx.state.shop.delete();
    ctx.status = 204;
  });

module.exports = router;
