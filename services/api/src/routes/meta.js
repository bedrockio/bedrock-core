import yd from '@bedrockio/yada';
import Router from '@koa/router';
import types from '../lib/notifications/types.js';
import documentation from '../utils/documentation.js';

import roles from '../roles.json' with { type: 'json' };

const router = new Router();

router.get(
  '/',
  documentation.include(
    documentation.description(
      'Get App Meta',
      'Returns the role definitions and notification types configured for the app.',
    ),
    documentation.success(200, {
      schema: {
        data: {
          roles: yd.object(),
          notifications: yd.array(
            yd.object({
              type: yd.string(),
              label: yd.string(),
              email: yd.boolean(),
              sms: yd.boolean(),
              push: yd.boolean(),
            }),
          ),
        },
      },
      example: {
        data: {
          roles: {
            admin: {
              name: 'Admin',
              allowScopes: ['global'],
              permissions: { users: 'all' },
            },
          },
          notifications: [{ type: 'product-updated', label: 'Product Updated', email: true }],
        },
      },
    }),
  ),
  async (ctx) => {
    ctx.body = {
      data: {
        roles,
        notifications: types,
      },
    };
  },
);

export default router;
