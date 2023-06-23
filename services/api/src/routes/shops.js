const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { Shop, AuditEntry } = require('../models');
const { exportValidation, csvExport } = require('../utils/csv');

const router = new Router();

router
  .use(authenticate())
  .param('id', fetchByParam(Shop))
  .post('/', validateBody(Shop.getCreateValidation()), async (ctx) => {
    const shop = await Shop.create(ctx.request.body);

    await AuditEntry.append('Created Shop', {
      ctx,
      object: shop,
    });

    ctx.body = {
      data: shop,
    };
  })
  .get('/:id', async (ctx) => {
    const shop = ctx.state.shop;
    ctx.body = {
      data: shop,
    };
  })
  .post(
    '/search',
    validateBody(
      Shop.getSearchValidation({
        ...exportValidation(),
      })
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
    }
  )
  .patch('/:id', validateBody(Shop.getUpdateValidation()), async (ctx) => {
    const shop = ctx.state.shop;
    const snapshot = new Shop(shop);

    shop.assign(ctx.request.body);

    await shop.save();

    await AuditEntry.append('Updated shop', {
      ctx,
      object: shop,
      fields: ['name', 'description', 'owner', 'address'],
      snapshot,
    });

    ctx.body = {
      data: shop,
    };
  })
  .delete('/:id', async (ctx) => {
    const { shop } = ctx.state;
    try {
      await shop.assertNoReferences({
        except: [AuditEntry],
      });
      await shop.delete();
      ctx.status = 204;
    } catch (err) {
      ctx.throw(400, err);
    }
  });

module.exports = router;
