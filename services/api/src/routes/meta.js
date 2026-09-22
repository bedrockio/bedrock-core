import Router from '@koa/router';
import types from '../lib/notifications/types.js';

import roles from '../roles.json' with { type: 'json' };

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    data: {
      roles,
      notifications: types,
    },
  };
});

export default router;
