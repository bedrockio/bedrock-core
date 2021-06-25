const Router = require('@koa/router');

const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { exportValidation, searchExport } = require('../utils/search');
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
        ...exportValidation,
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await AuditEntry.search(params);
      if (searchExport(ctx, data)) {
        return;
      }

      ctx.body = {
        data,
        meta,
      };
    }
  );

module.exports = router;
