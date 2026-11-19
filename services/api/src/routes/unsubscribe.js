import Router from '@koa/router';
import { authenticate } from '../utils/middleware/authenticate.js';
import { unsubscribe } from '../utils/notifications.js';

const router = new Router();

router.post('/', authenticate({ type: 'access', action: 'unsubscribe' }), async (ctx) => {
  const { jwt, authUser } = ctx.state;
  const { type, channel } = jwt;

  if (!type) {
    ctx.throw(400, 'No type found.');
  } else if (!channel) {
    ctx.throw(400, 'No channel found.');
  }

  await unsubscribe({
    type,
    channel,
    user: authUser,
  });

  ctx.status = 204;
});

export default router;
