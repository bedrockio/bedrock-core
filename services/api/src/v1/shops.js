const Router = require('koa-router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const Shop = require('../models/shop');

const router = new Router();

const schema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string()),
  categories: Joi.array().items(Joi.string()),
  country: Joi.string()
});

const patchSchema = schema.append({
  id: Joi.string().strip(),
  name: Joi.string(),
  categories: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string()),
  country: Joi.string(),
  createdAt: Joi.date().strip(),
  updatedAt: Joi.date().strip(),
  deletedAt: Joi.date().strip()
});

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('shop', async (id, ctx, next) => {
    const shop = await Shop.findById(id).populate('images');
    ctx.state.shop = shop;
    if (!shop) return (ctx.status = 404);
    return next();
  })
  .post(
    '/search',
    validate({
      body: Joi.object({
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string()
            .valid('asc', 'desc')
            .required()
        }).default({
          field: 'createdAt',
          order: 'desc'
        }),
        limit: Joi.number()
          .positive()
          .default(50)
      })
    }),
    async (ctx) => {
      const { sort, skip, limit } = ctx.request.body;
      const query = { deletedAt: { $exists: false } };
      const data = await Shop.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('images');

      const total = await await Shop.countDocuments(query);
      ctx.body = {
        data: data.map((i) => i.toResource()),
        meta: {
          total,
          skip,
          limit
        }
      };
    }
  )
  .post(
    '/',
    validate({
      body: schema
    }),
    async (ctx) => {
      const shop = await Shop.create(ctx.request.body);
      await shop.populate('images').execPopulate();
      ctx.body = {
        data: shop.toResource()
      };
    }
  )
  .delete('/:shop', async (ctx) => {
    await ctx.state.shop.delete();
    ctx.status = 204;
  })
  .patch(
    '/:shop',
    validate({
      body: patchSchema
    }),
    async (ctx) => {
      const shop = ctx.state.shop;
      Object.assign(shop, ctx.request.body);
      await shop.save();
      await shop.execPopulate();
      ctx.body = {
        data: shop.toResource()
      };
    }
  )
  .get('/:shop', async (ctx) => {
    const shop = ctx.state.shop;
    ctx.body = {
      data: shop.toResource()
    };
  });

module.exports = router;
