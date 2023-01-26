const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { exportValidation, csvExport } = require('../utils/csv');
const { AuditEntry } = require('../models');
const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .use(requirePermissions({ endpoint: 'auditEntries', permission: 'read', scope: 'global' }))
  .post(
    '/search',
    validateBody(
      AuditEntry.getSearchValidation({
        ...exportValidation(),
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await AuditEntry.search(params);
      if (format === 'csv') {
        return csvExport(ctx, data);
      }
      ctx.body = {
        data,
        meta,
      };
    }
  )
  .post(
    '/search-options',
    validateBody({
      field: yd.string().allow('routeNormalizedPath', 'objectType', 'activity', 'category').required(),
    }),
    async (ctx) => {
      const values = await AuditEntry.distinct(ctx.request.body.field);

      ctx.body = {
        data: values,
      };
    }
  );

module.exports = router;
