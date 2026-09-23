import Router from '@koa/router';
import { fetchByParam } from '../utils/middleware/params.js';
import { validateBody, validateDelete } from '../utils/middleware/validate.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { Shop, AuditEntry } from '../models/index.js';
import { csvExport } from '../utils/csv.js';

const router = new Router();

router
  .use(authenticate())
  .param('id', fetchByParam(Shop))
  .post('/', validateBody(Shop.getCreateValidation()), async (ctx) => {
    const shop = await Shop.create({
      ...ctx.request.body,
      user: ctx.state.authUser._id,
    });

    await AuditEntry.append('Created Shop', {
      ctx,
      object: shop,
      fields: ['name', 'user', 'country'],
    });

    ctx.body = {
      data: shop,
    };
  })
  .get('/:id', async (ctx) => {
    const { shop } = ctx.state;
    ctx.body = {
      data: shop,
    };
  })
  .post(
    '/search',
    validateBody(
      Shop.getSearchValidation({
        allowExport: true,
      }),
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await Shop.search(params);

      if (format === 'csv') {
        return csvExport(ctx, data, { filename });
      }

      ctx.body = {
        data,
        meta,
      };
    },
  )
  .patch('/:id', validateBody(Shop.getUpdateValidation()), async (ctx) => {
    const { shop } = ctx.state;
    const snapshot = new Shop(shop);

    shop.assign(ctx.request.body);

    await shop.save();

    await AuditEntry.append('Updated Shop', {
      ctx,
      object: shop,
      fields: ['name', 'user', 'country'],
      snapshot,
    });

    ctx.body = {
      data: shop,
    };
  })
  .delete('/:id', validateDelete(Shop.getDeleteValidation()), async (ctx) => {
    const { shop } = ctx.state;
    try {
      await shop.delete();
    } catch (err) {
      ctx.throw(400, err);
    }
    await AuditEntry.append('Deleted Shop', {
      ctx,
      object: shop,
    });
    ctx.status = 204;
  });

export default router;
