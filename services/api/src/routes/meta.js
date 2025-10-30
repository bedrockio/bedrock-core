const Router = require('@koa/router');
const types = require('../lib/notifications/types');

const roles = require('../roles.json');

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = {
    data: {
      roles,
      notifications: types,
    },
  };
});

module.exports = router;
