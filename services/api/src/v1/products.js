const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const { NotFoundError } = require('../lib/errors');
const Product = require('../models/product');
const { commonSearch } = require('../lib/utils/search');

const router = new Router();

const productSchema = Joi.object({
  name: Joi.string().required(),
  shop: Joi.string().required(),
  description: Joi.string(),
  expiresAt: Joi.string(),
  priceUsd: Joi.number().min(0.1).max(1000000),
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
  deletedAt: Joi.date().strip(),
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
    '/',
    validate({
      body: productSchema,
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
    ...commonSearch({
      defaultExportFilename: 'products.csv',
      defaultSortField: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['name', 'description'],
      model: Product,
      createQuery: async (ctx, query) => {
        const { shop } = ctx.request.body;

        if (shop) {
          query.shop = shop;
        }

        return {
          ...query,
        };
      },
      validateBody: {
        shop: Joi.string(),
      },
    })
  )
  .patch(
    '/:productId',
    validate({
      body: productPatchSchema,
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
