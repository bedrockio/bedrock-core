const Router = require('koa-router');
const Joi = require('@hapi/joi');
const User = require('../models/user');
const validate = require('../middlewares/validate');
const { authenticate, fetchUser, checkUserRole } = require('../middlewares/authenticate');
const { NotFoundError, BadRequestError } = require('../lib/errors');

const router = new Router();

const passwordField = Joi.string()
  .min(6)
  .message('Your password must be at least 6 characters long. Please try another.');

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('userId', async (id, ctx, next) => {
    const user = await User.findById(id);
    ctx.state.user = user;
    if (!user) {
      throw new NotFoundError();
    }
    return next();
  })
  .get('/me', (ctx) => {
    ctx.body = { data: ctx.state.authUser.toResource() };
  })
  .patch(
    '/me',
    validate({
      body: Joi.object({
        name: Joi.string(),
        timeZone: Joi.string()
      })
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      Object.assign(authUser, ctx.request.body);
      await authUser.save();
      ctx.body = { data: authUser.toResource() };
    }
  )
  .use(checkUserRole({ role: 'admin' }))
  .post(
    '/search',
    validate({
      body: Joi.object({
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string().required()
        }).default({
          field: 'createdAt',
          order: 'desc'
        }),
        limit: Joi.number()
          .positive()
          .default(50)
      })
    }),
    async (ctx) => {
      const { sort, skip, limit } = ctx.request.body;
      const query = { deletedAt: { $exists: false } };
      const data = await User.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await await User.countDocuments(query);
      ctx.body = {
        data: data.map((i) => i.toResource()),
        meta: {
          total,
          skip,
          limit
        }
      };
    }
  )
  .post(
    '/',
    validate({
      body: Joi.object({
        email: Joi.string()
          .lowercase()
          .email()
          .required(),
        name: Joi.string().required(),
        roles: Joi.array().items(Joi.string()),
        password: passwordField.required()
      })
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const existingUser = await User.findOne({ email, deletedAt: { $exists: false } });
      if (existingUser) {
        throw new BadRequestError('A user with that email already exists');
      }
      const user = await User.create(ctx.request.body);

      ctx.body = {
        data: user.toResource()
      };
    }
  )
  .delete('/:userId', async (ctx) => {
    const { user } = ctx.state;
    await user.delete();
    ctx.status = 204;
  })
  .patch(
    '/:userId',
    validate({
      body: Joi.object({
        id: Joi.string().strip(),
        email: Joi.string(),
        name: Joi.string(),
        roles: Joi.array().items(Joi.string()),
        createdAt: Joi.date().strip(),
        updatedAt: Joi.date().strip()
      })
    }),
    async (ctx) => {
      const { user } = ctx.state;
      user.assign(ctx.request.body);
      await user.save();
      ctx.body = {
        data: user.toResource()
      };
    }
  )
  .get('/:userId', async (ctx) => {
    ctx.body = {
      data: ctx.state.user.toResource()
    };
  });

module.exports = router;
