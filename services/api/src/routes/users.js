const Router = require('@koa/router');
const Joi = require('@hapi/joi');
const validate = require('../utils/middleware/validate');
const { authenticate, fetchUser, checkUserRole } = require('../utils/middleware/authenticate');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { searchValidation, exportValidation, getSearchQuery, search, searchExport } = require('../utils/search');
const { User } = require('../models');

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
    ctx.body = {
      data: ctx.state.authUser,
    };
  })
  .patch(
    '/me',
    validate({
      body: Joi.object({
        name: Joi.string(),
        timeZone: Joi.string(),
      }),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      authUser.assign(ctx.request.body);
      await authUser.save();
      ctx.body = {
        data: authUser,
      };
    }
  )
  .use(checkUserRole({ role: 'admin' }))
  .post(
    '/',
    validate({
      body: Joi.object({
        email: Joi.string().lowercase().email().required(),
        name: Joi.string().required(),
        roles: Joi.array().items(Joi.string()),
        password: passwordField.required(),
      }),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const existingUser = await User.findOne({ email, deletedAt: { $exists: false } });
      if (existingUser) {
        throw new BadRequestError('A user with that email already exists');
      }
      const user = await User.create(ctx.request.body);

      ctx.body = {
        data: user,
      };
    }
  )
  .get('/:userId', async (ctx) => {
    ctx.body = {
      data: ctx.state.user,
    };
  })
  .post(
    '/search',
    validate({
      body: Joi.object({
        ...searchValidation(),
        ...exportValidation(),
        name: Joi.string(),
        role: Joi.string(),
      }),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const query = getSearchQuery(body);

      const { name, role } = body;
      if (name) {
        query.name = {
          $regex: name,
          $options: 'i',
        };
      }
      if (role) {
        query.roles = { $in: [role] };
      }
      const { data, meta } = await search(User, query, body);

      if (searchExport(ctx, data)) {
        return;
      }

      ctx.body = {
        data,
        meta,
      };
    }
  )
  .patch(
    '/:userId',
    validate({
      body: Joi.object({
        id: Joi.string().strip(),
        email: Joi.string(),
        name: Joi.string(),
        roles: Joi.array().items(Joi.string()),
        createdAt: Joi.date().strip(),
        updatedAt: Joi.date().strip(),
      }),
    }),
    async (ctx) => {
      const { user } = ctx.state;
      user.assign(ctx.request.body);
      await user.save();
      ctx.body = {
        data: user,
      };
    }
  )
  .delete('/:userId', async (ctx) => {
    const { user } = ctx.state;
    await user.delete();
    ctx.status = 204;
  });

module.exports = router;
