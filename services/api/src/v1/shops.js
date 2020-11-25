const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const { NotFoundError } = require('../lib/errors');
const { Shop } = require('../models');

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
    validate({
      body: Joi.object({
        country: Joi.string(),
        startAt: Joi.date(),
        endAt: Joi.date(),
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string().valid('asc', 'desc').required(),
        }).default({
          field: 'createdAt',
          order: 'desc',
        }),
        ids: Joi.array().items(Joi.string()),
        limit: Joi.number().positive().default(50),
      }),
    }),
    async (ctx) => {
      const { ids = [], sort, skip, limit, country, startAt, endAt } = ctx.request.body;
      const query = {
        ...(ids.length ? { _id: { $in: ids } } : {}),
        deletedAt: { $exists: false },
      };
      if (startAt || endAt) {
        query.createdAt = {};
        if (startAt) {
          query.createdAt.$gte = startAt;
        }
        if (endAt) {
          query.createdAt.$lte = endAt;
        }
      }
      if (country) {
        query.country = country;
      }
      const data = await Shop.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await Shop.countDocuments(query);
      ctx.body = {
        data,
        meta: {
          total,
          skip,
          limit,
        },
      };
    }
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
