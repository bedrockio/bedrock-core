const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { exportValidation, csvExport } = require('../utils/csv');
const { AuditEntry } = require('../models');
const user = require('../models/user');
const router = new Router();

router
  .use(authenticate())
  .use(requirePermissions('auditEntries.read'))
  .post(
    '/search',
    validateBody(
      AuditEntry.getSearchValidation({
        ...exportValidation(),
        user: yd.string(),
      }),
    ),
    async (ctx) => {
      const { user, format, filename, ...params } = ctx.request.body;

      if (user) {
        params.$or = [
          {
            actor: user,
          },
          {
            owner: user,
          },
          {
            object: user,
          },
        ];
      }

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
    },
  )
  .post(
    '/search-options',
    validateBody({
      field: yd.string().allow('routeNormalizedPath', 'objectType', 'activity').required(),
    }),
    async (ctx) => {
      console.log(ctx.request.body.field);
      const values = await AuditEntry.distinct(ctx.request.body.field);

      console.log(values);

      ctx.body = {
        data: values,
      };
    },
  );

module.exports = router;
