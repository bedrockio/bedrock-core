const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../../../utils/middleware/validate');
const { authenticate } = require('../../../utils/middleware/authenticate');

const { createAuthToken, createTemporaryAuthToken } = require('../../../utils/auth/tokens');
const { register, login, signupValidation, verifyLoginAttempts } = require('../../../utils/auth');
const { verifyPassword } = require('../../../utils/auth/password');
const { createOtp } = require('../../../utils/auth/otp');
const { sendMail, sendSms } = require('../../../utils/messaging');
const { User, AuditEntry } = require('../../../models');

const router = new Router();

router
  .post(
    '/register',
    validateBody(
      signupValidation.append({
        password: yd.string().password().required(),
      })
    ),
    async (ctx) => {
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
    }
  )
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
        await user.save();
        ctx.throw(401, error);
      }

      try {
        await verifyPassword(user, password);
      } catch (error) {
        await user.save();
        await AuditEntry.append('Password incorrect', {
          ctx,
          actor: user,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      let next;
      let token;
      const { mfaMethod } = user;

      if (mfaMethod === 'sms') {
        const code = await createOtp(user);
        await sendSms({
          user,
          code,
          template: 'otp',
        });
        next = {
          type: 'otp',
          phone: user.phone,
        };
      } else if (mfaMethod === 'email') {
        const code = await createOtp(user);
        await sendMail({
          user,
          code,
          template: 'otp',
        });
        next = {
          type: 'otp',
          email: user.email,
        };
      } else if (mfaMethod === 'totp') {
        next = {
          type: 'totp',
          email: user.email,
        };
      } else {
        try {
          token = await login(user, ctx);
        } catch (error) {
          ctx.throw(401, error);
        }
      }

      ctx.body = {
        data: {
          next,
          token,
        },
      };
    }
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
        const token = createTemporaryAuthToken(user, ctx);
        await user.save();

        await sendMail({
          user,
          email,
          token,
          template: 'reset-password',
        });
      }

      ctx.status = 204;
    }
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

      const token = createAuthToken(authUser, ctx);
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
    }
  );

module.exports = router;
