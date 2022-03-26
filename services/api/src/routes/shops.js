const mongoose = require('mongoose');
const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Shop } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('shopId', async (id, ctx, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404, 'ObjectId in path is not valid');
    }
    const shop = await Shop.findById(id);
    if (!shop) {
      ctx.throw(404);
    }
    ctx.state.shop = shop;
    return next();
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
  .post('/search', validateBody(Shop.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Shop.search(ctx.request.body);
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
