const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { exportValidation, csvExport } = require('../utils/csv');
const { AuditEntry } = require('../models');
const router = new Router();

router
  .use(authenticate())
  .use(requirePermissions('auditEntries.read'))
  .post(
    '/search',
    validateBody(
      AuditEntry.getSearchValidation({
        ...exportValidation(),
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await AuditEntry.search(params).populate('object', {
        name: 1,
        id: 1,
      });

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
      field: yd.string().allow('routeNormalizedPath', 'objectType', 'activity').required(),
    }),
    async (ctx) => {
      const values = await AuditEntry.distinct(ctx.request.body.field);

      ctx.body = {
        data: values,
      };
    }
  );

module.exports = router;
