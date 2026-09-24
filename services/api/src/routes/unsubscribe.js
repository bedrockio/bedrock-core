import Router from '@koa/router';
import { authenticate } from '../utils/middleware/authenticate.js';
import { unsubscribe } from '../utils/notifications.js';
import documentation from '../utils/documentation.js';

const router = new Router();

router.post(
  '/',
  authenticate({ type: 'access' }),
  documentation.include(
    documentation.description(
      'Unsubscribe',
      'Turns off a notification type on a channel for the user in the unsubscribe token.',
    ),
    documentation.success(204),
  ),
  async (ctx) => {
    const { jwt, authUser } = ctx.state;
    const { action, type, channel } = jwt;

    if (action !== 'unsubscribe') {
      ctx.throw(400, 'Invalid token.');
    } else if (!type) {
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
  },
);

export default router;
