const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { validateBody } = require('../utils/middleware/validate');
const { validateToken } = require('../utils/middleware/tokens');
const { authenticate } = require('../utils/middleware/authenticate');
const { createTemporaryToken, generateTokenId } = require('../utils/tokens');
const { sendTemplatedMail } = require('../utils/mailer');
const { User, Invite, AuditEntry } = require('../models');
const config = require('@bedrockio/config');

const mfa = require('../utils/mfa');
const sms = require('../utils/sms');

const { verifyLoginAttempts, verifyPassword } = require('../utils/auth');

const router = new Router();

const APP_NAME = config.get('APP_NAME');

const registerValidator = yd
  .object({
    email: yd
      .string()
      .lowercase()
      .email()
      .custom((val, { root }) => {
        if (val && !root.password) {
          throw new Error('password is required when email is provided');
        }
      }),
    phoneNumber: yd.string().phone(),
    firstName: yd.string().required(),
    lastName: yd.string().required(),
    password: yd.string().password(),
  })
  .custom((val) => {
    if (!val.email && !val.phoneNumber) {
      throw new Error('email or phoneNumber is required');
    }
  });

router
  .post('/register', validateBody(registerValidator), async (ctx) => {
    const { email, phoneNumber } = ctx.request.body;

    // TODO: Avoid leaking that a user exists with that email/phone-number
    // TODO: To be removed once we have enforce a constraint
    if (email && (await User.exists({ email }))) {
      ctx.throw(400, 'A user with that email already exists');
    }
    // TODO: to be removed once we have enforce a constraint
    if (phoneNumber && (await User.exists({ phoneNumber }))) {
      ctx.throw(400, 'A user with that phone number already exists');
    }

    const user = new User({
      ...ctx.request.body,
    });

    const token = user.createAuthToken({
      ip: ctx.get('x-forwarded-for') || ctx.ip,
      country: ctx.get('cf-ipcountry'),
      userAgent: ctx.get('user-agent'),
    });
    await user.save();

    await AuditEntry.append('Registered', {
      ctx,
      actor: user,
    });

    if (email) {
      await sendTemplatedMail({
        user,
        file: 'welcome.md',
      });
    }

    ctx.body = {
      data: { token },
    };
  })
  .post(
    '/login',
    validateBody({
      email: yd.string().email().trim().required(),
      password: yd.string().password().required(),
    }),
    async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOne({ email });

      if (!user) {
        ctx.throw(401, 'Incorrect password');
      }

      try {
        await verifyLoginAttempts(user);
      } catch (error) {
        await AuditEntry.append('Reached max authentication attempts', {
          ctx,
          actor: user,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      try {
        await verifyPassword(user, password);
      } catch (error) {
        await AuditEntry.append('Failed authentication', {
          ctx,
          actor: user,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      if (await mfa.requireChallenge(ctx, user)) {
        const tokenId = generateTokenId();
        const mfaToken = createTemporaryToken({ type: 'mfa', sub: user.id, jti: tokenId });
        user.tempTokenId = tokenId;
        await user.save();
        ctx.body = {
          data: {
            mfaToken,
            mfaRequired: true,
            mfaMethod: user.mfaMethod,
            mfaPhoneNumber: user.mfaPhoneNumber?.slice(-4),
          },
        };
        return;
      }

      const token = user.createAuthToken({
        ip: ctx.get('x-forwarded-for') || ctx.ip,
        country: ctx.get('cf-ipcountry'),
        userAgent: ctx.get('user-agent'),
      });
      await user.save();

      await AuditEntry.append('Successfully authenticated', {
        ctx,
        actor: user,
      });

      ctx.body = {
        data: { token: token },
      };
    }
  )
  .post(
    '/login/send-sms',
    validateBody({
      phoneNumber: yd.string().phone().required(),
    }),
    async (ctx) => {
      const { phoneNumber } = ctx.request.body;

      const user = await User.findOne({ phoneNumber });
      // TODO: avoid leaking that a user exists with that phone number
      if (!user) {
        ctx.throw(400, 'Could not find a user with that phone number, try again!');
      }

      if (!user.smsSecret) {
        const secret = mfa.generateSecret();
        user.smsSecret = secret;
        await user.save();
      }

      const smsCode = mfa.generateToken(user.smsSecret);
      await sms.sendMessage(user.phoneNumber, `Your ${APP_NAME} login code is: ${smsCode}`);
      if (process.env.ENV_NAME === 'development') {
        console.info(`SMS code for ${user.phoneNumber}: ${smsCode}`);
      }
      ctx.status = 204;
    }
  )
  .post(
    '/login/verify-sms',
    validateBody({
      phoneNumber: yd.string().phone().required(),
      code: yd.string().required(),
    }),
    async (ctx) => {
      const { phoneNumber, code } = ctx.request.body;

      const user = await User.findOne({ phoneNumber });
      if (!user) {
        ctx.throw(400, 'Invalid login code');
      }

      try {
        await verifyLoginAttempts(user);
      } catch (error) {
        await AuditEntry.append('Reached max authentication attempts', {
          ctx,
          category: 'security',
          object: user,
          actor: user,
        });
        ctx.throw(401, error);
      }

      if (!mfa.verifyToken(user.smsSecret, 'sms', code)) {
        await AuditEntry.append('Failed authentication', {
          ctx,
          category: 'security',
          object: user,
          actor: user,
        });
        ctx.throw(400, 'Invalid login code');
      }

      // just because the user has successful verified their phone doesn't mean they get to bypass mfa
      if (await mfa.requireChallenge(ctx, user)) {
        const tokenId = generateTokenId();
        const mfaToken = createTemporaryToken({ type: 'mfa', sub: user.id, jti: tokenId });
        user.tempTokenId = tokenId;
        await user.save();
        ctx.body = {
          data: {
            mfaToken,
            mfaRequired: true,
            mfaMethod: user.mfaMethod,
            mfaPhoneNumber: user.mfaPhoneNumber?.slice(-4),
          },
        };
        return;
      }

      const token = user.createAuthToken({
        ip: ctx.get('x-forwarded-for') || ctx.ip,
        country: ctx.get('cf-ipcountry'),
        userAgent: ctx.get('user-agent'),
      });
      await user.save();

      await AuditEntry.append('Authenticated', {
        ctx,
        object: user,
        actor: user,
      });

      ctx.body = { data: { token } };
    }
  )
  .post(
    '/confirm-access',
    validateBody({
      password: yd.string().password(),
    }),
    authenticate(),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { password } = ctx.request.body;

      try {
        await verifyLoginAttempts(authUser);
      } catch (error) {
        await AuditEntry.append('Reached max authentication attempts', {
          ctx,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      try {
        await verifyPassword(authUser, password);
      } catch (error) {
        await AuditEntry.append('Failed authentication (confirm-access)', {
          ctx,
          category: 'security',
        });
        ctx.throw(401, error);
      }

      await AuditEntry.append('Successfully authenticated (confirm-access)', {
        ctx,
      });

      authUser.accessConfirmedAt = new Date();
      await authUser.save();
      ctx.status = 204;
    }
  )
  .post(
    '/logout',
    validateBody({
      all: yd.boolean(),
      jti: yd.string(),
    }),
    authenticate(),
    async (ctx) => {
      const user = ctx.state.authUser;
      const { body } = ctx.request;
      const jti = body.jti || ctx.state.jwt.jti;
      if (body.all) {
        user.authInfo = [];
      } else if (jti) {
        user.removeAuthToken(jti);
      }
      await user.save();

      await AuditEntry.append('Deauthentication', {
        ctx,
      });

      ctx.status = 204;
    }
  )
  .post(
    '/accept-invite',
    validateBody({
      firstName: yd.string().required(),
      lastName: yd.string().required(),
      password: yd.string().password().required(),
    }),
    validateToken({ type: 'invite' }),
    async (ctx) => {
      const { firstName, lastName, password } = ctx.request.body;
      const invite = await Invite.findByIdAndUpdate(ctx.state.jwt.inviteId, {
        $set: { status: 'accepted' },
      });
      if (!invite) {
        return ctx.throw(400, 'Invite could not be found');
      }

      const existingUser = await User.findOne({ email: invite.email });

      if (existingUser) {
        const token = existingUser.createAuthToken({
          ip: ctx.get('x-forwarded-for') || ctx.ip,
          country: ctx.get('cf-ipcountry'),
          userAgent: ctx.get('user-agent'),
        });
        await existingUser.save();
        ctx.body = {
          data: { token },
        };
        return;
      }

      const user = new User({
        firstName,
        lastName,
        email: invite.email,
        password,
      });

      const token = user.createAuthToken({
        ip: ctx.get('x-forwarded-for') || ctx.ip,
        country: ctx.get('cf-ipcountry'),
        userAgent: ctx.get('user-agent'),
      });
      await user.save();

      await AuditEntry.append('Registered', {
        ctx,
        actor: user,
      });

      ctx.body = {
        data: { token },
      };
    }
  )
  .post(
    '/request-password',
    validateBody({
      email: yd.string().email().required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });
      if (!user) {
        ctx.throw(400, 'Unknown email address.');
      }

      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      await user.updateOne({ tempTokenId: tokenId });

      await sendTemplatedMail({
        user,
        email,
        token,
        file: 'reset-password.md',
      });

      ctx.status = 204;
    }
  )
  .post(
    '/set-password',
    validateBody({
      password: yd.string().password().required(),
    }),
    validateToken({ type: 'password' }),
    async (ctx) => {
      const { jwt } = ctx.state;
      const { password } = ctx.request.body;
      const user = await User.findById(jwt.sub);
      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.tempTokenId !== jwt.jti) {
        await AuditEntry.append('Attempted reset password', {
          ctx,
          actor: user,
          category: 'security',
        });
        ctx.throw(400, 'Token is invalid (jti)');
      }

      user.loginAttempts = 0;
      user.password = password;
      user.tempTokenId = undefined;
      const token = user.createAuthToken({
        ip: ctx.get('x-forwarded-for') || ctx.ip,
        country: ctx.get('cf-ipcountry'),
        userAgent: ctx.get('user-agent'),
      });
      await user.save();

      await AuditEntry.append('Reset password', {
        ctx,
        actor: user,
      });

      ctx.body = {
        data: { token },
      };
    }
  );

module.exports = router;
