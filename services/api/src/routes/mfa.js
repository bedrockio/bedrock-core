const Router = require('@koa/router');
const config = require('@bedrockio/config');
const Joi = require('joi');
const router = new Router();
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { User, AuditEntry } = require('../models');

const mfa = require('../utils/mfa');
const sms = require('../utils/sms');
const { sendTemplatedMail } = require('../utils/mailer');
const { validateBody } = require('../utils/middleware/validate');
const { verifyLoginAttempts } = require('../utils/auth');

const checkPasswordVerification = (ctx, next) => {
  const { authUser } = ctx.state;
  // If accessConfirmedAt is older than 30 mins
  if (authUser.accessConfirmedAt < Date.now() - 30 * 60 * 1000) {
    ctx.throw(403, 'Confirm access');
  }
  return next();
};

router
  .post('/send-code', authenticate({ type: 'mfa' }), async (ctx) => {
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

      const user = await User.findOne({ _id: jwt.sub });

      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.tempTokenId !== jwt.jti) {
        ctx.throw(400, 'Token is invalid (jti)');
      }

      try {
        await verifyLoginAttempts(user);
      } catch (error) {
        await AuditEntry.append('Reached max mfa challenge attempts', ctx, {
          category: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, error);
      }

      // if backup code e.g 12345-16123
      const backupCodes = (user.mfaBackupCodes || []).concat();
      const foundBackupCode = backupCodes.indexOf(code);

      if (foundBackupCode !== -1) {
        backupCodes.splice(foundBackupCode, 1);
        user.mfaBackupCodes = backupCodes;
        await user.save();
        await AuditEntry.append('Successfully authenticated (mfa using backup code)', ctx, {
          object: user,
          user: user.id,
        });
      } else if (!mfa.verifyToken(user.mfaSecret, user.mfaMethod, code)) {
        await AuditEntry.append('Failed mfa challenge', ctx, {
          category: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(400, 'Not a valid code');
      }

      await AuditEntry.append('Successfully authenticated (mfa)', ctx, {
        object: user,
        user: user.id,
      });

      const token = user.newAuthToken({
        ip: ctx.get('x-forwarded-for') || ctx.ip,
        userAgent: ctx.get('user-agent'),
      });
      await user.save();

      ctx.body = {
        data: { token: token },
      };
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
      user: authUser,
      file: 'mfa-disabled.md',
    });

    ctx.status = 204;
  })
  .post(
    '/setup',
    validateBody({
      method: Joi.string().allow('sms', 'otp').required(),
      phoneNumber: Joi.string(),
    }),
    checkPasswordVerification,
    async (ctx) => {
      const { method, phoneNumber } = ctx.request.body;

      if (method === 'sms' && !phoneNumber) {
        ctx.throw(400, 'phoneNumber is required');
      }

      const secret = mfa.generateSecret();

      if (method === 'sms') {
        await sms.sendMessage(
          phoneNumber,
          `Your ${config.get('APP_NAME')} verification code is: ${mfa.generateToken(secret)}`
        );
      }

      ctx.body = {
        data: {
          secret,
        },
      };
    }
  )
  .post('/generate-backup-codes', async (ctx) => {
    ctx.body = {
      data: {
        codes: mfa.generateBackupCodes(),
      },
    };
  })
  .post(
    '/check-code',
    validateBody({
      code: Joi.string().required(),
      secret: Joi.string().required(),
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
      authUser.mfaBackupCodes = backupCodes;
      await authUser.save();

      await sendTemplatedMail({
        file: authUser.mfaMethod === 'otp' ? 'mfa-otp-enabled.md' : 'mfa-sms-enabled.md',
        phoneLast4: authUser.mfaPhoneNumber?.slice(-4),
        user: authUser,
      });

      ctx.status = 204;
    }
  );

module.exports = router;
