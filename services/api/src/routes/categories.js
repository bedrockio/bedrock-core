const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Category } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .post('/search', validateBody(Category.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Category.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  });

module.exports = router;
