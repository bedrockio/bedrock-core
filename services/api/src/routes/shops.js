const Router = require('@koa/router');
const Joi = require('joi');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { searchValidation, getSearchQuery, search } = require('../utils/search');
const { NotFoundError } = require('../utils/errors');
const { Shop } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('shopId', async (id, ctx, next) => {
    const shop = await Shop.findById(id);
    ctx.state.shop = shop;
    if (!shop) {
      throw new NotFoundError();
    }
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
  .post(
    '/search',
    validateBody({
      // --- Generator: search
      name: Joi.string(),
      countryCode: Joi.string(),
      category: Joi.string(),
      // --- Generator: end
      ...searchValidation(),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const query = getSearchQuery(body, {
        keywordFields: ['name'],
      });

      // --- Generator: vars
      const { countryCode, category } = ctx.request.body;
      // --- Generator: end

      // --- Generator: queries
      if (countryCode) {
        query['address.countryCode'] = countryCode;
      }
      if (category) {
        query.categories = category;
      }
      // --- Generator: end

      const { data, meta } = await search(Shop, query, body);
      ctx.body = {
        data,
        meta,
      };
    }
  )
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
