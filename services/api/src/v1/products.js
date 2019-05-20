const Router = require('koa-router');
const Joi = require('joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const Product = require('../models/product');

const router = new Router();

const productSchema = {
  name: Joi.string().required(),
  shopId: Joi.string().required(),
  description: Joi.string(),
  expiresAt: Joi.string(),
  priceUsd: Joi.number()
    .min(0.1)
    .max(1000000),
  isFeatured: Joi.boolean(),
  sellingPoints: Joi.array().items(Joi.string())
};

const productPatchSchema = {
  ...productSchema,
  name: Joi.string().optional(),
  shopId: Joi.string().optional(),
  id: Joi.string().strip(),
  createdAt: Joi.date().strip(),
  updatedAt: Joi.date().strip(),
  deletedAt: Joi.date().strip()
};

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('product', async (id, ctx, next) => {
    const product = await Product.findById(id);
    ctx.state.product = product;
    if (!product) return (ctx.status = 404);
    return next();
  })
  .post(
    '/search',
    validate({
      body: {
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string()
            .valid(['asc', 'desc'])
            .required()
        }).default({
          field: 'createdAt',
          order: 'desc'
        }),
        shopId: Joi.string(),
        limit: Joi.number()
          .positive()
          .default(50)
      }
    }),
    async (ctx) => {
      const { sort, skip, limit, shopId } = ctx.request.body;
      const query = { deletedAt: { $exists: false } };
      if (shopId) {
        query.shopId = shopId;
      }
      const data = await Product.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);
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
      body: productSchema
    }),
    async (ctx) => {
      const product = await Product.create(ctx.request.body);
      ctx.body = {
        data: product.toResource()
      };
    }
  )
  .delete('/:product', async (ctx) => {
    const product = ctx.state.product;
    await product.delete();
    ctx.status = 204;
  })
  .patch(
    '/:product',
    validate({
      body: productPatchSchema
    }),
    async (ctx) => {
      const product = ctx.state.product;
      Object.assign(product, ctx.request.body);
      await product.save();
      ctx.body = {
        data: product.toResource()
      };
    }
  )
  .get('/:product', async (ctx) => {
    const { product } = await ctx.state;
    ctx.body = {
      data: product.toResource()
    };
  });

module.exports = router;
