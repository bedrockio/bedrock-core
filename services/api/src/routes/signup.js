const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { sendOtp } = require('../utils/auth/otp');
const { sendMessage } = require('../utils/messaging');
const { createAuthToken } = require('../utils/auth/tokens');
const { validateBody } = require('../utils/middleware/validate');

const { User, AuditEntry } = require('../models');

const router = new Router();

router.post(
  '/',
  validateBody({
    type: yd.string().allow('link', 'code', 'password').default('password'),
    transport: yd.string().allow('email', 'sms').default('email'),
    firstName: yd.string().required(),
    lastName: yd.string().required(),
    password: yd
      .string()
      .password()
      .missing(({ root }) => {
        if (root.type === 'password') {
          throw new Error('Password is required.');
        }
      }),
    email: yd
      .string()
      .email()
      .custom(async (val) => {
        if (await User.exists({ email: val })) {
          throw new Error('A user with that email already exists.');
        }
      })
      .missing(({ root }) => {
        if (root.transport === 'email') {
          throw new Error('Email is required.');
        }
      }),
    phone: yd
      .string()
      .phone()
      .custom(async (val) => {
        if (await User.exists({ phone: val })) {
          throw new Error('A user with that phone number already exists.');
        }
      })
      .missing(({ root }) => {
        if (root.transport === 'sms') {
          throw new Error('Phone is required.');
        }
      }),
  }),
  async (ctx) => {
    const { type, transport, password, ...rest } = ctx.request.body;
    const user = await User.create({
      ...rest,
      password,
    });

    await AuditEntry.append('Signed Up', {
      ctx,
      actor: user,
    });

    let token;
    let challenge;

    if (password) {
      await sendMessage({
        user,
        template: 'welcome',
      });
      token = createAuthToken(ctx, user);
      await user.save();
    } else {
      challenge = await sendOtp(user, {
        type,
        transport,
        phase: 'signup',
      });
    }

    ctx.body = {
      data: {
        token,
        challenge,
      },
    };
  }
);

module.exports = router;
