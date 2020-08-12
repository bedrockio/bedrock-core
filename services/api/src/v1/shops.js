const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const { NotFoundError } = require('../lib/errors');
const Shop = require('../models/shop');

const router = new Router();

const schema = Joi.object({
  // --- Generator: create
  name: Joi.string().required(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string()),
  categories: Joi.array().items(Joi.string()),
  country: Joi.string(),
  // --- Generator
});

const patchSchema = schema.append({
  id: Joi.string().strip(),
  // --- Generator: update
  name: Joi.string(),
  categories: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string()),
  country: Joi.string(),
  // --- Generator
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
    '/search',
    validate({
      body: Joi.object({
        // --- Generator: search
        name: Joi.string(),
        country: Joi.string(),
        // --- Generator
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
        limit: Joi.number().positive().default(50),
      }),
    }),
    async (ctx) => {
      const { sort, skip, limit, startAt, endAt } = ctx.request.body;
      // --- Generator: vars
      const { name, country } = ctx.request.body;
      // --- Generator
      const query = { deletedAt: { $exists: false } };

      // --- Generator: queries
      if (name) {
        query.name = {
          $regex: name,
          $options: 'i',
        };
      }
      if (country) {
        query.country = country;
      }
      // --- Generator

      if (startAt || endAt) {
        query.createdAt = {};
        if (startAt) {
          query.createdAt.$gte = startAt;
        }
        if (endAt) {
          query.createdAt.$lte = endAt;
        }
      }
      const data = await Shop.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await await Shop.countDocuments(query);
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
  .delete('/:shopId', async (ctx) => {
    await ctx.state.shop.delete();
    ctx.status = 204;
  })
  .patch(
    '/:shopId',
    validate({
      body: patchSchema,
    }),
    async (ctx) => {
      const shop = ctx.state.shop;
      shop.assign(ctx.request.body);
      await shop.save();
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
  });

module.exports = router;
