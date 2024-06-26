const Router = require('@koa/router');
const { NOTIFICATION_TYPES } = require('../lib/notifications');

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    data: {
      notifications: NOTIFICATION_TYPES,
    },
  };
});

module.exports = router;
