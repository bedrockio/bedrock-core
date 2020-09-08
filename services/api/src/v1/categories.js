const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser } = require('../middlewares/authenticate');
const Category = require('../models/category');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .post(
    '/search',
    validate({
      body: Joi.object({
        name: Joi.string(),
        ids: Joi.array().items(Joi.string()),
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string().valid('asc', 'desc').required(),
        }).default({
          field: 'createdAt',
          order: 'desc',
        }),
        limit: Joi.number().positive().default(50),
      }),
    }),
    async (ctx) => {
      const { ids = [], sort, skip, limit, name } = ctx.request.body;
      const query = {
        ...(ids.length ? { _id: { $in: ids } } : {}),
        ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
        deletedAt: { $exists: false },
      };

      const data = await Category.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await Category.countDocuments(query);
      ctx.body = {
        data,
        meta: {
          total,
          skip,
          limit,
        },
      };
    }
  );

module.exports = router;
