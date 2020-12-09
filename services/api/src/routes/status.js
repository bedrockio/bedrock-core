const Router = require('@koa/router');
const { User } = require('../models');

const router = new Router();

router
  .get('/', async (ctx) => {
    ctx.body = {
      success: true,
    };
  })
  .get('/mongodb', async (ctx) => {
    const numItems = await User.countDocuments({});
    ctx.body = {
      success: numItems > 0,
    };
  });

module.exports = router;
