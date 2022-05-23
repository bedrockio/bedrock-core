const Router = require('@koa/router');
const Joi = require('joi');
const mongoose = require('mongoose');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions, mergeRoles } = require('../utils/middleware/permissions');
const { exportValidation, csvExport } = require('../utils/csv');
const { User } = require('../models');
const { expandRoles } = require('./../utils/permissions');
const roles = require('./../roles.json');
const permissions = require('./../permissions.json');
const { sendTemplatedMail } = require('../utils/mailer');
const { createTemporaryToken } = require('../utils/tokens');

const router = new Router();

function sendInvite(sender, user) {
  return sendTemplatedMail({
    to: user.email,
    file: 'invite.md',
    sender,
    token: createTemporaryToken({ type: 'invite', sub: user._id, email: user.email }),
  });
}

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
        return csvExport(ctx, data);
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
  .post('/:userId/re-invite', async (ctx) => {
    const { user, authUser } = ctx.state;
    if (user.status !== 'invite') {
      ctx.throw(400, `You can't invite a user that has the status ${user.status}`);
    }
    await sendInvite(authUser, user);
    ctx.status = 204;
  })
  .post(
    '/',
    validateBody(
      User.getCreateValidation({
        password: passwordField,
      })
    ),
    async (ctx) => {
      const { email, password } = ctx.request.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        ctx.throw(400, 'A user with that email already exists');
      }
      const userFields = ctx.request.body;
      userFields.status = password ? 'activate' : 'invite';

      const user = await User.create(userFields);
      if (!password) {
        await sendInvite(ctx.status.authUser, user);
      }

      ctx.body = {
        data: user,
      };
    }
  )
  .post(
    '/invite',
    validateBody({
      emails: Joi.array().items(Joi.string().email()).required(),
      role: Joi.string()
        .valid(...Object.keys(roles))
        .required(),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { emails, role } = ctx.request.body;

      let userRoles = [];
      if (role) {
        const def = roles[role];
        if (def.allowScopes.includes('global')) {
          userRoles = [{ role, scope: 'global' }];
        } else {
          // TODO: allow for multiple scopes, leaving it up to the implementor to decide
          // roles.roles = [{ role, scope: 'organization', scopeRef: organization.id }];
        }
      }

      const uniqueEmails = new Set(emails);
      for (const email of uniqueEmails) {
        const user = await User.findOne({ email, status: 'invite' });
        user.roles = mergeRoles(user.roles, ...userRoles);
        await user.save();
        await sendInvite(authUser, user);
      }
      ctx.status = 204;
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
