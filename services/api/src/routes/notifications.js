const yd = require('@bedrockio/yada');
const Router = require('@koa/router');
const { validateToken } = require('../utils/middleware/tokens');
const { validateBody } = require('../utils/middleware/validate');
const { unsubscribe } = require('../utils/notifications');
const { User } = require('../models');

const router = new Router();

router.post(
  '/unsubscribe',
  validateBody({
    type: yd.string().required(),
    token: yd.string().required(),
    channel: yd.string().allow('all', 'email', 'sms', 'push'),
  }),
  validateToken({ type: 'mail' }),
  async (ctx) => {
    const { sub } = ctx.state.jwt;
    const { type, channel } = ctx.request.body;

    const user = await User.findOne({
      email: sub,
    });

    if (!user) {
      ctx.throw(400, 'No user found.');
    }

    await unsubscribe({
      user,
      type,
      channel,
    });

    ctx.status = 204;
  },
);

module.exports = router;
