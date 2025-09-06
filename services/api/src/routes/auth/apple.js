const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../utils/middleware/validate');
const { authenticate } = require('../../utils/middleware/authenticate');

const { login } = require('../../utils/auth');
const { createAuthToken } = require('../../utils/tokens');
const { verifyToken, upsertAppleAuthenticator, removeAppleAuthenticator } = require('../../utils/auth/apple');
const { User, AuditEntry } = require('../../models');

const router = new Router();

router
  .post(
    '/',
    validateBody({
      token: yd.string().required(),
      firstName: yd.string(),
      lastName: yd.string(),
    }),
    async (ctx) => {
      const { token: appleToken, firstName, lastName } = ctx.request.body;

      let payload;
      try {
        payload = await verifyToken(appleToken);
      } catch (error) {
        ctx.throw(400, error);
      }

      let user = await User.findOne({
        email: payload.email,
      });

      let token;
      let result;

      if (user) {
        token = await login(ctx, user, {
          message: 'Logged in with Apple',
        });

        result = 'login';
      } else {
        try {
          user = await User.create({
            ...payload,
            firstName,
            lastName,
          });
        } catch {
          ctx.throw('Signup failed. Remove your Apple registration.');
        }

        token = createAuthToken(ctx, user);

        await AuditEntry.append('Signed Up with Apple', {
          ctx,
          actor: user,
        });

        result = 'signup';
      }

      upsertAppleAuthenticator(user);
      await user.save();

      ctx.body = {
        data: {
          token,
          result,
        },
      };
    },
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
        upsertAppleAuthenticator(authUser);
        await authUser.save();
      } catch (error) {
        ctx.throw(400, error);
      }

      ctx.body = {
        data: authUser,
      };
    },
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
