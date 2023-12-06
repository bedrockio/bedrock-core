const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../../utils/middleware/validate');
const { authenticate } = require('../../../utils/middleware/authenticate');

const { login, register, signupValidation } = require('../../../utils/auth');
const { User } = require('../../../models');

const { verifyToken, addAppleAuthenticator, removeAppleAuthenticator } = require('./utils');

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
        addAppleAuthenticator(user);
        ctx.body = {
          data: {
            token: await login(user, ctx),
          },
        };
      } else {
        ctx.body = {
          data: {
            next: 'signup',
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
        addAppleAuthenticator(user);

        ctx.body = {
          data: {
            token: await register(user, ctx),
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
        addAppleAuthenticator(authUser);
        await authUser.save();
      } catch (error) {
        ctx.throw(400, error);
      }

      ctx.body = {
        data: authUser,
      };
    }
  )
  .post('/disable', async (ctx) => {
    const { authUser } = ctx.state;
    // Note that AppleId allows for revoking tokens, however this does
    // not seem to remove it from the "Sign in with Apple" list or have
    // any effect on subsequent logins, so skipping this step and simply
    // remove the authenticator.
    removeAppleAuthenticator(authUser);
    await authUser.save();

    ctx.body = {
      data: authUser,
    };
  });

module.exports = router;
