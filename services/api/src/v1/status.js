const Router = require('@koa/router');
const { models } = require('../database');

const router = new Router();

router
  .get('/', async (ctx) => {
    ctx.body = {
      success: true,
    };
  })
  .get('/mongodb', async (ctx) => {
    const numItems = await models.User.countDocuments({});
    ctx.body = {
      success: numItems > 0,
    };
  });

module.exports = router;
