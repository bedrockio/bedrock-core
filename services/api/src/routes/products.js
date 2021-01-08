const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { NotFoundError } = require('../utils/errors');
const { Product } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('productId', async (id, ctx, next) => {
    const product = await Product.findById(id);
    ctx.state.product = product;
    if (!product) {
      throw new NotFoundError();
    }
    return next();
  })
  .post(
    '/',
    validate({
      body: Product.getValidator(),
    }),
    async (ctx) => {
      const product = await Product.create(ctx.request.body);
      ctx.body = {
        data: product,
      };
    }
  )
  .get('/:productId', async (ctx) => {
    const { product } = await ctx.state;
    ctx.body = {
      data: product,
    };
  })
  .post(
    '/search',
    validate({
      body: Joi.object({
        name: Joi.string(),
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string().valid('asc', 'desc').required(),
        }).default({
          field: 'createdAt',
          order: 'desc',
        }),
        ids: Joi.array().items(Joi.string()),
        shop: Joi.string(),
        limit: Joi.number().positive().default(50),
      }),
    }),
    async (ctx) => {
      const { ids = [], sort, name, skip, limit, shop } = ctx.request.body;
      const query = {
        ...(ids.length ? { _id: { $in: ids } } : {}),
        deletedAt: { $exists: false },
      };
      if (shop) {
        query.shop = shop;
      }
      if (name) {
        query.name = {
          $regex: name,
          $options: 'i',
        };
      }
      const data = await Product.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);
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
    '/:productId',
    validate({
      body: Product.getPatchValidator(),
    }),
    async (ctx) => {
      const product = ctx.state.product;
      product.assign(ctx.request.body);
      await product.save();
      ctx.body = {
        data: product,
      };
    }
  )
  .delete('/:productId', async (ctx) => {
    const product = ctx.state.product;
    await product.delete();
    ctx.status = 204;
  });

module.exports = router;
