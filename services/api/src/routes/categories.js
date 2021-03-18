const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { searchValidation, getSearchQuery, search } = require('../utils/search');
const { Category } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .post(
    '/search',
    validate({
      body: Joi.object({
        name: Joi.string(),
        ...searchValidation(),
      }),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const query = getSearchQuery(body, {
        keywordFields: ['name'],
      });
      const { data, meta } = await search(Category, query, body);
      ctx.body = {
        data,
        meta,
      };
    }
  );

module.exports = router;
