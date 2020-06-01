const Router = require('koa-router');
const Shop = require('../models/shop');

const router = new Router();

router
  .get('/', async (ctx) => {
    ctx.body = {
      success: true
    };
  })
  .get('/mongodb', async (ctx) => {
    const numItems = await Shop.countDocuments({});
    ctx.body = {
      success: numItems > 0
    };
  })

module.exports = router;