import Router from '@koa/router';
import { fetchByParam } from '../utils/middleware/params.js';
import { validateBody } from '../utils/middleware/validate.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { requirePermissions } from '../utils/middleware/permissions.js';
import { csvExport } from '../utils/csv.js';
import { Product } from '../models/index.js';

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

export default router;
