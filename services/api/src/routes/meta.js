const Router = require('@koa/router');
const types = require('../lib/notifications/types');

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    data: {
      notifications: types,
    },
  };
});

module.exports = router;
