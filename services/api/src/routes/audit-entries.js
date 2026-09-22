import Router from '@koa/router';
import yd from '@bedrockio/yada';

import { validateBody } from '../utils/middleware/validate.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { requirePermissions } from '../utils/middleware/permissions.js';
import { csvExport } from '../utils/csv.js';
import { AuditEntry } from '../models/index.js';
const router = new Router();

router
  .use(authenticate())
  .use(requirePermissions('auditEntries.read'))
  .post(
    '/search',
    validateBody(
      AuditEntry.getSearchValidation({
        allowExport: true,
      }).append({
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
      const values = await AuditEntry.distinct(ctx.request.body.field);

      ctx.body = {
        data: values,
      };
    },
  );

export default router;
