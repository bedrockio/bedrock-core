const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../utils/middleware/validate');

const { sendOtp } = require('../../utils/auth/otp');
const { verifyOtp } = require('../../utils/auth/otp');
const { login, verifyLoginAttempts } = require('../../utils/auth/login');
const { verifyRecentPassword } = require('../../utils/auth/password');

const { AuditEntry } = require('../../models');
const { findUser } = require('./utils');

const router = new Router();

router
  .post(
    '/send',
    validateBody({
      type: yd.string().allow('link', 'code').default('link'),
      channel: yd.string().allow('email', 'sms').default('email'),
      email: yd.string().email(),
      phone: yd.string().phone(),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const user = await findUser(ctx);

      const challenge = await sendOtp(user, {
        ...body,
        phase: 'login',
      });

      ctx.body = {
        data: {
          challenge,
        },
      };
    },
  )
  .post(
    '/login',
    validateBody({
      code: yd.string().length(6).required(),
      email: yd.string().email(),
      phone: yd.string().phone(),
    }),
    async (ctx) => {
      const { code, email, phone } = ctx.request.body;
      const user = await findUser(ctx);

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
        verifyOtp(user, code);
      } catch (error) {
        await user.save();
        await AuditEntry.append('Incorrect OTP', {
          ctx,
          actor: user,
        });
        ctx.throw(401, error);
      }

      try {
        await verifyRecentPassword(user);
      } catch (error) {
        ctx.throw(401, error);
      }

      if (email) {
        user.emailVerified = true;
      } else if (phone) {
        user.phoneVerified = true;
      }

      ctx.body = {
        data: {
          token: await login(ctx, user),
        },
      };
    },
  );

module.exports = router;
