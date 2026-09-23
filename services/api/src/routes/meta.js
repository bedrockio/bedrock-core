import Router from '@koa/router';
import config from '@bedrockio/config';
import types from '../lib/notifications/types.js';

import roles from '../roles.json' with { type: 'json' };

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    data: {
      roles,
      notifications: types,
      auth: {
        type: config.get('AUTH_TYPE'),
        channel: config.get('AUTH_CHANNEL'),
        passkey: config.get('AUTH_PASSKEY', 'boolean'),
      },
    },
  };
});

export default router;
