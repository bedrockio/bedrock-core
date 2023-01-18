const Router = require('@koa/router');
const Joi = require('joi');
const mongoose = require('mongoose');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { exportValidation, csvExport } = require('../utils/csv');
const { User } = require('../models');
const { expandRoles } = require('./../utils/permissions');

const roles = require('./../roles.json');
const permissions = require('./../permissions.json');

const { AuditEntry } = require('../models');

const router = new Router();

const passwordField = Joi.string()
  .min(6)
  .message('Your password must be at least 6 characters long. Please try another.');

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('userId', async (id, ctx, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404);
    }
    const user = await User.findById(id);
    if (!user) {
      ctx.throw(404);
    }
    ctx.state.user = user;
    return next();
  })
  .get('/me', async (ctx) => {
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
      theme: Joi.string(),
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
  .post(
    '/:userId/impersonate',
    requirePermissions({ endpoint: 'users', permission: 'write', scope: 'global' }),
    async (ctx) => {
      const { user } = ctx.state;
      const authUser = ctx.state.authUser;

      // Don't allow an superAdmin to imitate another superAdmin
      const allowedRoles = expandRoles(authUser).roles.reduce(
        (result, { roleDefinition }) => result.concat(roleDefinition.canImpersonateRoles || []),
        []
      );

      const isAllowed = [...user.roles].every(({ role }) => allowedRoles.includes(role));
      if (!isAllowed) {
        ctx.throw(403, 'You do not have permission to create tokens for this user');
      }

      // attached the spoof token to authUser
      const token = authUser.createAuthToken(
        {
          ip: ctx.get('x-forwarded-for') || ctx.ip,
          country: ctx.get('cf-ipcountry'),
          userAgent: ctx.get('user-agent'),
        },
        {
          // setting user id to the user we are impersonating
          impersonatedUser: user.id,
          // expires in 2 hours (in seconds)
          exp: Math.floor(Date.now() / 1000) + 120 * 60,
        }
      );
      await authUser.save();

      await AuditEntry.append('Impersonated user', ctx, {
        object: user,
        user: authUser,
      });

      ctx.body = {
        data: { token },
      };
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
      if (format === 'csv') {
        return csvExport(ctx, data, { filename });
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

      await AuditEntry.append('Created User', ctx, {
        object: user,
      });

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

      await AuditEntry.append('Updated user', ctx, {
        object: user,
        fields: ['email', 'roles'],
      });

      ctx.body = {
        data: user,
      };
    }
  )
  .delete('/:userId', async (ctx) => {
    const { user } = ctx.state;
    await user.assertNoReferences({
      except: [AuditEntry],
    });
    await user.delete();
    ctx.status = 204;
  });

module.exports = router;
