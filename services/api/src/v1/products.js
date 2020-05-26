const Router = require('koa-router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const { NotFoundError } = require('../lib/errors');
const Product = require('../models/product');

const router = new Router();

const productSchema = Joi.object({
  name: Joi.string().required(),
  shop: Joi.string().required(),
  description: Joi.string(),
  expiresAt: Joi.string(),
  priceUsd: Joi.number()
    .min(0.1)
    .max(1000000),
  isFeatured: Joi.boolean(),
  images: Joi.array().items(Joi.string()),
  sellingPoints: Joi.array().items(Joi.string()),
});

const productPatchSchema = productSchema.append({
  name: Joi.string().optional(),
  shop: Joi.string().optional(),
  id: Joi.string().strip(),
  createdAt: Joi.date().strip(),
  updatedAt: Joi.date().strip(),
  deletedAt: Joi.date().strip()
});

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
        shop: Joi.string(),
        limit: Joi.number()
          .positive()
          .default(50)
      })
    }),
    async (ctx) => {
      const { sort, skip, limit, shop } = ctx.request.body;
      const query = { deletedAt: { $exists: false } };
      if (shop) {
        query.shop = shop;
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
          limit
        }
      };
    }
  )
  .post(
    '/',
    validate({
      body: productSchema
    }),
    async (ctx) => {
      const product = await Product.create(ctx.request.body);
      ctx.body = {
        data: product
      };
    }
  )
  .delete('/:productId', async (ctx) => {
    const product = ctx.state.product;
    await product.delete();
    ctx.status = 204;
  })
  .patch(
    '/:productId',
    validate({
      body: productPatchSchema
    }),
    async (ctx) => {
      const product = ctx.state.product;
      Object.assign(product, ctx.request.body);
      await product.save();
      ctx.body = {
        data: product
      };
    }
  )
  .get('/:productId', async (ctx) => {
    const { product } = await ctx.state;
    ctx.body = {
      data: product
    };
  });

module.exports = router;
