const Router = require('@koa/router');
const config = require('@bedrockio/config');
const Joi = require('joi');
const router = new Router();
const { authenticate, fetchUser } = require('../../utils/middleware/authenticate');
const { User, AuditEntry } = require('../../models');

const mfa = require('../../utils/mfa');
const sms = require('../../utils/sms');
const { createAuthToken } = require('../../utils/tokens');
const { sendTemplatedMail } = require('../../utils/mailer');
const { validateBody } = require('../../utils/middleware/validate');

const checkPasswordVerification = (ctx, next) => {
  const { authUser } = ctx.state;
  // If accessConfirmedAt is older than 30 mins
  if (authUser.accessConfirmedAt < Date.now() - 30 * 60 * 1000) {
    ctx.throw(403, 'Confirm access');
  }
  return next();
};

router
  .post('/send-token', authenticate({ type: 'mfa' }), async (ctx) => {
    const { jwt } = ctx.state;
    const user = await User.findOne({ _id: jwt.sub });

    if (user.mfaMethod !== 'sms') {
      ctx.throw(400, 'sms multi factor verification is not enabled for this account');
    }

    if (!user.mfaPhoneNumber || !user.mfaSecret) {
      ctx.throw(400, 'sms multi factor verification has not been configured correctly');
    }

    await sms.sendMessage(
      user.mfaPhoneNumber,
      `Your ${config.get('APP_NAME')} verification code is: ${mfa.generateToken(user.mfaSecret)}`
    );

    ctx.status = 204;
  })
  .post(
    '/verify',
    validateBody({
      code: Joi.string().required(),
    }),
    authenticate({ type: 'mfa' }),
    async (ctx) => {
      const { jwt } = ctx.state;
      const { code } = ctx.request.body;

      const user = await User.findOneAndUpdate(
        { _id: jwt.sub },
        {
          lastLoginAttemptAt: new Date(),
          $inc: { loginAttempts: 1 },
        }
      );

      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.tempTokenId !== jwt.jti) {
        ctx.throw(400, 'Token is invalid (jti)');
      }

      if (!user.verifyLoginAttempts()) {
        await AuditEntry.append('reached max mfa challenge attempts', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, 'Too many attempts');
      }

      // if backup code e.g 12345-16123
      const backupCodes = (user.backupCodes || []).concat();
      const foundBackupCode = backupCodes.indexOf(code);

      if (foundBackupCode !== -1) {
        backupCodes.splice(foundBackupCode, 1);
        user.backupCodes = backupCodes;
        await user.save();
        await AuditEntry.append('successfully authenticated (mfa using backup code)', ctx, {
          object: user,
          user: user.id,
        });
      } else if (!mfa.verifyToken(user.mfaSecret, user.mfaMethod, code)) {
        await AuditEntry.append('failed mfa challenge', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(400, 'Not a valid code');
      }

      await AuditEntry.append('successfully authenticated (mfa)', ctx, {
        object: user,
        user: user.id,
      });

      ctx.body = { data: { token: createAuthToken(user.id, user.authTokenId) } };
    }
  );

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .delete('/disable', checkPasswordVerification, async (ctx) => {
    const { authUser } = ctx.state;
    authUser.mfaSecret = undefined;
    authUser.mfaMethod = undefined;
    authUser.mfaPhoneNumber = undefined;
    await authUser.save();

    await sendTemplatedMail({
      to: authUser.fullName,
      template: 'mfa-disabled.md',
      subject: 'Two-factor authentication disabled',
      firstName: authUser.firstName,
    });

    ctx.status = 204;
  })
  .post(
    '/config',
    validateBody({
      method: Joi.string().allow('sms', 'otp').required(),
      phoneNumber: Joi.string(),
    }),
    checkPasswordVerification,
    async (ctx) => {
      const { authUser } = ctx.state;

      const { method, phoneNumber } = ctx.request.body;

      if (method === 'sms' && !phoneNumber) {
        ctx.throw(400, 'phoneNumber is required');
      }

      const { secret, uri } = mfa.generateSecret({
        name: config.get('APP_NAME'),
        account: authUser.email,
      });

      if (method === 'sms') {
        await sms.sendMessage(
          phoneNumber,
          `Your ${config.get('APP_NAME')} verification code is: ${mfa.generateToken(secret)}`
        );
      }

      ctx.body = {
        data: {
          secret,
          uri,
        },
      };
    }
  )
  .post('/generate-codes', async (ctx) => {
    ctx.body = {
      data: mfa.generateBackupCodes(),
    };
  })
  .post(
    '/confirm-code',
    validateBody({
      code: Joi.string(),
      secret: Joi.string(),
      method: Joi.string().allow('sms', 'otp').required(),
    }),
    async (ctx) => {
      const { secret, code, method } = ctx.request.body;
      // allow 2 "windows" with sms to ensure that sms can be delieved in time
      if (!mfa.verifyToken(secret, method, code)) {
        ctx.throw('Not a valid code', 400);
      }
      ctx.status = 204;
    }
  )
  .post(
    '/enable',
    validateBody({
      secret: Joi.string(),
      method: Joi.string().allow('sms', 'otp').required(),
      phoneNumber: Joi.string(),
      backupCodes: Joi.array().items(Joi.string()).required(),
    }),
    checkPasswordVerification,
    async (ctx) => {
      const { authUser } = ctx.state;
      const { secret, method, phoneNumber, backupCodes } = ctx.request.body;

      if (method === 'sms' && !phoneNumber) {
        ctx.throw(400, 'phoneNumber is required');
      }

      authUser.mfaPhoneNumber = phoneNumber;
      authUser.mfaMethod = method;
      authUser.mfaSecret = secret;
      authUser.backupCodes = backupCodes;
      await authUser.save();

      await sendTemplatedMail({
        to: authUser.fullName,
        template: authUser.mfaMethod === 'otp' ? 'mfa-otp-enabled.md' : 'mfa-sms-enabled.md',
        subject: 'Two-factor authentication enabled',
        mfaPhoneNumber: authUser.mfaPhoneNumber?.slice(-4),
        firstName: authUser.firstName,
      });

      ctx.status = 204;
    }
  );

module.exports = router;
