const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../../utils/middleware/validate');
const { authenticate } = require('../../utils/middleware/authenticate');

const { createAuthToken, createTemporaryAuthToken } = require('../../utils/auth/tokens');
const { login, verifyLoginAttempts } = require('../../utils/auth');
const { verifyPassword } = require('../../utils/auth/password');
const { sendOtp } = require('../../utils/auth/otp');
const { sendMail } = require('../../utils/messaging');
const { User, AuditEntry } = require('../../models');

const router = new Router();

router
  .post(
    '/login',
    validateBody({
      email: yd.string().email().required(),
      password: yd.string().password().required(),
    }),
    async (ctx) => {
      const { email, password } = ctx.request.body;

      const user = await User.findOne({
        email,
      });

      if (!user) {
        // Do not reveal that a user does not exist.
        ctx.throw(401, 'Incorrect password');
      }

      try {
        await verifyLoginAttempts(user, ctx);
      } catch (error) {
        ctx.throw(401, error);
      }

      try {
        await verifyPassword(user, password);
      } catch (error) {
        await AuditEntry.append('Password Incorrect', {
          ctx,
          actor: user,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      let token;
      let challenge;
      const { mfaMethod } = user;

      if (mfaMethod === 'email' || mfaMethod === 'sms') {
        challenge = await sendOtp(user, {
          type: 'code',
          phase: 'login',
          channel: mfaMethod,
        });
      } else if (mfaMethod === 'totp') {
        challenge = {
          type: 'code',
          channel: 'authenticator',
          email: user.email,
        };
      } else if (mfaMethod === 'none') {
        try {
          token = await login(ctx, user);
        } catch (error) {
          ctx.throw(401, error);
        }
      }

      ctx.body = {
        data: {
          token,
          challenge,
        },
      };
    },
  )
  .post(
    '/request',
    validateBody({
      email: yd.string().email().required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });

      if (user) {
        const token = createTemporaryAuthToken(ctx, user);
        await user.save();

        await sendMail({
          user,
          email,
          token,
          template: 'reset-password',
        });
      }

      ctx.status = 204;
    },
  )
  .use(authenticate())
  .post(
    '/update',
    validateBody({
      password: yd.string().password().required(),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { password } = ctx.request.body;
      authUser.password = password;
      authUser.loginAttempts = 0;

      const token = createAuthToken(ctx, authUser);
      await authUser.save();

      await AuditEntry.append('Reset password', {
        ctx,
        actor: authUser,
      });

      ctx.body = {
        data: {
          token,
        },
      };
    },
  );

module.exports = router;
