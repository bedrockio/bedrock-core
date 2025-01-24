const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../../utils/middleware/validate');
const { authenticate } = require('../../../utils/middleware/authenticate');

const { verifyRecentPassword } = require('../../../utils/auth/password');
const { login, verifyLoginAttempts } = require('../../../utils/auth');
const { expandRoles } = require('../../../utils/permissions');
const { User, AuditEntry } = require('../../../models');

const { verifyCode, verifyTotp, generateTotp, enableTotp, revokeTotp } = require('./utils');

const router = new Router();

router
  .post(
    '/login',
    validateBody({
      email: yd.string().email().required(),
      code: yd.string().length(6).required(),
    }),
    async (ctx) => {
      const { email, code } = ctx.request.body;

      const user = await User.findOne({
        email,
      });

      if (!user) {
        ctx.throw(400, 'User not found.');
      }

      try {
        await verifyLoginAttempts(user, ctx);
      } catch (error) {
        await user.save();
        ctx.throw(401, error);
      }

      try {
        verifyTotp(user, code);
      } catch (error) {
        await user.save();
        await AuditEntry.append('Incorrect Authenticator Code', {
          ctx,
          actor: user,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      try {
        await verifyRecentPassword(user);
      } catch (error) {
        ctx.throw(401, error);
      }

      ctx.body = {
        data: {
          token: await login(ctx, user),
        },
      };
    }
  )
  .use(authenticate())
  .post('/request', async (ctx) => {
    try {
      ctx.body = {
        data: generateTotp(),
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .post(
    '/enable',
    validateBody({
      secret: yd.string().required(),
      code: yd.string().length(6).required(),
    }),
    async (ctx) => {
      const { secret, code } = ctx.request.body;
      const { authUser } = ctx.state;
      try {
        verifyCode(secret, code);
        enableTotp(authUser, secret);
        await authUser.save();
        ctx.body = {
          data: expandRoles(authUser, ctx),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .post('/disable', async (ctx) => {
    let { authUser } = ctx.state;
    try {
      revokeTotp(authUser);
      await authUser.save();
      ctx.body = {
        data: expandRoles(authUser, ctx),
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  });

module.exports = router;
