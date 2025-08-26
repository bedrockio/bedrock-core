const Router = require('@koa/router');
const { authenticate } = require('../utils/middleware/authenticate');
const { unsubscribe } = require('../utils/notifications');

const router = new Router();

router.post('/', authenticate({ type: 'access' }), async (ctx) => {
  const { jwt, authUser } = ctx.state;
  const { action, name, channel } = jwt;

  if (action !== 'unsubscribe') {
    ctx.throw(400, 'Invalid token.');
  } else if (!name) {
    ctx.throw(400, 'No name found.');
  } else if (!channel) {
    ctx.throw(400, 'No channel found.');
  }

  await unsubscribe({
    name,
    channel,
    user: authUser,
  });

  ctx.status = 204;
});

module.exports = router;
