const Router = require('@koa/router');
const Joi = require('joi');
const validate = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { searchValidation, exportValidation, getSearchQuery, search, searchExport } = require('../utils/search');
const { AuditLog } = require('../models');
const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .use(requirePermissions({ endpoint: 'auditLogs', permission: 'read', scope: 'global' }))
  .post(
    '/search',
    validate({
      body: Joi.object({
        ...searchValidation(),
        ...exportValidation(),
        userId: Joi.string(),
        objectId: Joi.string(),
        type: Joi.string(),
      }),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const query = getSearchQuery(body, {
        keywordFields: ['objectId', 'userId', 'activity'],
      });

      const { userId, objectId, type } = body;
      if (userId) {
        query.userId = userId;
      }
      if (objectId) {
        query.objectId = objectId;
      }
      if (type) {
        query.type = type;
      }

      const { data, meta } = await search(AuditLog, query, body);

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
