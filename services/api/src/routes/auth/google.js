const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../utils/middleware/validate');
const { authenticate } = require('../../utils/middleware/authenticate');

const { login, createAuthToken } = require('../../utils/auth');
const { verifyToken, upsertGoogleAuthenticator, removeGoogleAuthenticator } = require('../../utils/auth/google');

const { User, AuditEntry } = require('../../models');

const router = new Router();

router
  .post(
    '/',
    validateBody({
      code: yd.string().required(),
    }),
    async (ctx) => {
      const { code } = ctx.request.body;

      let payload;
      try {
        payload = await verifyToken(code);
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
          message: 'Logged in with Google',
        });

        result = 'login';
      } else {
        user = await User.create({
          ...payload,
        });

        token = createAuthToken(ctx, user);

        await AuditEntry.append('Signed Up with Google', {
          ctx,
          actor: user,
          category: 'auth',
        });

        result = 'signup';
      }

      upsertGoogleAuthenticator(user);
      await user.save();

      ctx.body = {
        data: {
          token,
          result,
        },
      };
    }
  )
  .use(authenticate())
  .post('/disable', async (ctx) => {
    const { authUser } = ctx.state;
    removeGoogleAuthenticator(authUser);
    await authUser.save();

    ctx.body = {
      data: authUser,
    };
  });

module.exports = router;
