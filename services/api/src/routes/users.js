const Router = require('@koa/router');
const config = require('@bedrockio/config');
const Joi = require('joi');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { exportValidation, searchExport } = require('../utils/search');
const mfa = require('../utils/mfa');
const sms = require('../utils/sms');
const { User } = require('../models');
const { expandRoles } = require('./../utils/permissions');
const roles = require('./../roles.json');
const permissions = require('./../permissions.json');

const router = new Router();

const passwordField = Joi.string()
  .min(6)
  .message('Your password must be at least 6 characters long. Please try another.');

const checkPasswordVerification = (ctx, next) => {
  const { authUser } = ctx.state;
  // If accessConfirmedAt is older than 10 mins
  if (authUser.accessConfirmedAt < Date.now() - 10 * 60 * 1000) {
    ctx.throw(403, 'Confirm access');
  }
  return next();
};

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('userId', async (id, ctx, next) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        ctx.throw(404);
      }
      ctx.state.user = user;
      return next();
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('/me', (ctx) => {
    const { authUser } = ctx.state;
    ctx.body = {
      data: expandRoles(authUser),
    };
  })
  .patch(
    '/me',
    validateBody({
      firstName: Joi.string(),
      lastName: Joi.string(),
      timeZone: Joi.string(),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      authUser.assign(ctx.request.body);
      await authUser.save();
      ctx.body = {
        data: expandRoles(authUser),
      };
    }
  )
  .delete('/me/mfa/disable', checkPasswordVerification, async (ctx) => {
    const { authUser } = ctx.state;
    authUser.mfaSecret = undefined;
    authUser.mfaMethod = undefined;
    await authUser.save();
    ctx.status = 204;
  })
  .post(
    '/me/mfa/config',
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
  .post(
    '/me/mfa/enable',
    validateBody({
      code: Joi.string(),
      secret: Joi.string(),
      method: Joi.string().allow('sms', 'otp').required(),
      phoneNumber: Joi.string(),
    }),
    checkPasswordVerification,
    async (ctx) => {
      const { authUser } = ctx.state;
      const { secret, code, method, phoneNumber } = ctx.request.body;
      // allow 2 "windows" with sms to ensure that sms can be delieved in time
      if (!mfa.verifyToken(secret, method, code)) {
        ctx.throw('Not a valid code', 400);
      }

      if (method === 'sms' && !phoneNumber) {
        ctx.throw(400, 'phoneNumber is required');
      }

      authUser.mfaPhoneNumber = phoneNumber;
      authUser.mfaMethod = method;
      authUser.mfaSecret = secret;
      await authUser.save();
      ctx.status = 204;
    }
  )
  .use(requirePermissions({ endpoint: 'users', permission: 'read', scope: 'global' }))
  .get('/roles', (ctx) => {
    ctx.body = {
      data: roles,
    };
  })
  .get('/permissions', (ctx) => {
    ctx.body = {
      data: permissions,
    };
  })
  .post(
    '/search',
    validateBody(
      User.getSearchValidation({
        ...exportValidation(),
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { data, meta } = await User.search(params);
      if (searchExport(ctx, data)) {
        return;
      }
      ctx.body = {
        data: data.map((item) => expandRoles(item)),
        meta,
      };
    }
  )
  .get('/:userId', async (ctx) => {
    ctx.body = {
      data: expandRoles(ctx.state.user),
    };
  })
  .use(requirePermissions({ endpoint: 'users', permission: 'write', scope: 'global' }))
  .post(
    '/',
    validateBody(
      User.getCreateValidation({
        password: passwordField.required(),
      })
    ),
    async (ctx) => {
      const { email } = ctx.request.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        ctx.throw(400, 'A user with that email already exists');
      }
      const user = await User.create(ctx.request.body);

      ctx.body = {
        data: user,
      };
    }
  )
  .patch(
    '/:userId',
    validateBody(
      User.getUpdateValidation().append({
        roles: (roles) => {
          return roles.map((role) => {
            const { roleDefinition, ...rest } = role;
            return rest;
          });
        },
      })
    ),
    async (ctx) => {
      const { user } = ctx.state;
      user.assign(ctx.request.body);
      await user.save();
      ctx.body = {
        data: user,
      };
    }
  )
  .delete('/:userId', async (ctx) => {
    const { user } = ctx.state;
    await user.delete();
    ctx.status = 204;
  });

module.exports = router;
