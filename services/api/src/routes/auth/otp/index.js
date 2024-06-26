const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../../../utils/middleware/validate');

const { login, register, signupValidation, verifyLoginAttempts } = require('../../../utils/auth');
const { verifyRecentPassword } = require('../../../utils/auth/password');
const { createOtp, verifyOtp } = require('../../../utils/auth/otp');

const { sendMessage } = require('../../../utils/messaging');
const { User, AuditEntry } = require('../../../models');

const router = new Router();

async function getUser(ctx) {
  const { phone, email } = ctx.request.body;

  let query;
  if (phone) {
    query = { phone };
  } else if (email) {
    query = { email };
  } else {
    ctx.throw(400, 'Phone or email is required.');
  }

  return await User.findOne(query);
}

router
  .post(
    '/send-code',
    validateBody({
      email: yd.string().email(),
      phone: yd.string().phone(),
    }),
    async (ctx) => {
      const { email, phone } = ctx.request.body;
      const user = await getUser(ctx);

      // If no user continue on as if code was sent.
      if (user) {
        const code = await createOtp(user);
        await sendMessage({
          phone,
          email,
          code,
          template: 'otp',
        });
      }

      ctx.status = 204;
    }
  )
  .post(
    '/login',
    validateBody({
      code: yd.string().length(6),
      email: yd.string().email(),
      phone: yd.string().phone(),
    }),
    async (ctx) => {
      const { code, email, phone } = ctx.request.body;
      const user = await getUser(ctx);

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
        await AuditEntry.append('Incorrect Code', {
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

      if (email) {
        user.emailVerified = true;
      } else if (phone) {
        user.phoneVerified = true;
      }

      ctx.body = {
        data: {
          token: await login(user, ctx),
        },
      };
    }
  )
  .post('/register', validateBody(signupValidation.omit('password')), async (ctx) => {
    try {
      const user = new User(ctx.request.body);
      ctx.body = {
        data: {
          token: await register(user, ctx),
        },
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  });

module.exports = router;
