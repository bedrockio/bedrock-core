const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { csvExport } = require('../utils/csv');
const { Product } = require('../models');

const router = new Router();

router
  .use(authenticate())
  .param('id', fetchByParam(Product))
  .post('/', requirePermissions('products.write'), validateBody(Product.getCreateValidation()), async (ctx) => {
    const product = await Product.create(ctx.request.body);

    ctx.body = {
      data: product,
    };
  })
  .get('/:id', async (ctx) => {
    const { product } = await ctx.state;
    ctx.body = {
      data: product,
    };
  })
  .post(
    '/search',
    validateBody(
      Product.getSearchValidation({
        allowExport: true,
      }),
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await Product.search(params);

      if (format === 'csv') {
        return csvExport(ctx, data, { filename });
      }

      ctx.body = {
        data,
        meta,
      };
    },
  )
  .patch('/:id', requirePermissions('products.write'), validateBody(Product.getUpdateValidation()), async (ctx) => {
    const { product } = ctx.state;
    product.assign(ctx.request.body);

    await product.save();

    ctx.body = {
      data: product,
    };
  })
  .delete('/:id', requirePermissions('products.write'), async (ctx) => {
    const { product } = ctx.state;
    await product.delete();
    ctx.status = 204;
  });

module.exports = router;
