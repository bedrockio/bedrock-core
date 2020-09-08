const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const { NotFoundError } = require('../lib/errors');
const { commonSearch } = require('../lib/utils/search');
const Shop = require('../models/shop');

const router = new Router();

const schema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string()),
  categories: Joi.array().items(Joi.string()),
  country: Joi.string(),
});

const patchSchema = schema.append({
  id: Joi.string().strip(),
  name: Joi.string(),
  categories: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string()),
  country: Joi.string(),
  createdAt: Joi.date().strip(),
  updatedAt: Joi.date().strip(),
  deletedAt: Joi.date().strip(),
});

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
  .post(
    '/',
    validate({
      body: schema,
    }),
    async (ctx) => {
      const shop = await Shop.create(ctx.request.body);
      ctx.body = {
        data: shop,
      };
    }
  )
  .get('/:shopId', async (ctx) => {
    const shop = ctx.state.shop;
    ctx.body = {
      data: shop,
    };
  })
  .post(
    '/search',
    ...commonSearch({
      defaultExportFilename: 'shops.csv',
      defaultSortField: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['name', 'description'],
      model: Shop,
      createQuery: async (ctx, query) => {
        const { country } = ctx.request.body;

        if (country) {
          query.country = country;
        }

        return {
          ...query,
        };
      },
      validateBody: {
        country: Joi.string(),
      },
    })
  )
  .patch(
    '/:shopId',
    validate({
      body: patchSchema,
    }),
    async (ctx) => {
      const shop = ctx.state.shop;
      shop.assign(ctx.request.body);
      await shop.save();
      await shop.execPopulate();
      ctx.body = {
        data: shop,
      };
    }
  )
  .delete('/:shopId', async (ctx) => {
    await ctx.state.shop.delete();
    ctx.status = 204;
  });

module.exports = router;
