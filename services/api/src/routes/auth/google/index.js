const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../../utils/middleware/validate');
const { authenticate } = require('../../../utils/middleware/authenticate');

const { login, register, signupValidation } = require('../../../utils/auth');
const { User } = require('../../../models');

const { verifyToken, addGoogleAuthenticator, removeGoogleAuthenticator } = require('./utils');

const router = new Router();

router
  .post(
    '/login',
    validateBody({
      token: yd.string().required(),
    }),
    async (ctx) => {
      const { token } = ctx.request.body;

      let payload;
      try {
        payload = await verifyToken(token);
      } catch (error) {
        ctx.throw(400, error);
      }

      const user = await User.findOne({
        email: payload.email,
      });

      if (user) {
        addGoogleAuthenticator(user);
        ctx.body = {
          data: {
            token: await login(ctx, user),
          },
        };
      } else {
        const { firstName, lastName } = payload;
        ctx.body = {
          data: {
            next: 'signup',
            body: {
              firstName,
              lastName,
            },
          },
        };
      }
    }
  )
  .post(
    '/register',
    validateBody(
      signupValidation
        .append({
          token: yd.string().required(),
        })
        .omit('email')
    ),
    async (ctx) => {
      const { token, ...rest } = ctx.request.body;

      let email;
      try {
        const payload = await verifyToken(token);
        email = payload.email;
      } catch (error) {
        ctx.throw(400, error);
      }

      try {
        const user = new User({
          ...rest,
          email,
        });
        addGoogleAuthenticator(user);

        ctx.body = {
          data: {
            token: await register(ctx, user),
          },
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .use(authenticate())
  .post(
    '/enable',
    validateBody({
      token: yd.string().required(),
    }),
    async (ctx) => {
      const { token } = ctx.request.body;
      const { authUser } = ctx.state;

      try {
        await verifyToken(token);
      } catch (error) {
        ctx.throw(400, error);
      }

      addGoogleAuthenticator(authUser);
      await authUser.save();

      ctx.body = {
        data: authUser,
      };
    }
  )
  .post('/disable', async (ctx) => {
    const { authUser } = ctx.state;
    removeGoogleAuthenticator(authUser);
    await authUser.save();

    ctx.body = {
      data: authUser,
    };
  });

module.exports = router;
