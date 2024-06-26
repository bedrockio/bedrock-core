const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');

const { exportValidation, csvExport } = require('../utils/csv');
const { createImpersonateAuthToken } = require('../utils/auth/tokens');
const { expandRoles, validateUserRoles } = require('./../utils/permissions');
const { User } = require('../models');

const roles = require('./../roles.json');

const { AuditEntry } = require('../models');

const router = new Router();

router
  .use(authenticate())
  .param('id', fetchByParam(User))
  .get('/me', async (ctx) => {
    const { authUser } = ctx.state;
    ctx.body = {
      data: expandRoles(authUser, ctx),
    };
  })
  .patch('/me', validateBody(User.getUpdateValidation()), async (ctx) => {
    const { authUser } = ctx.state;
    authUser.assign(ctx.request.body);
    await authUser.save();
    ctx.body = {
      data: expandRoles(authUser, ctx),
    };
  })
  .post('/:id/authenticate', requirePermissions('users.impersonate'), async (ctx) => {
    const { user } = ctx.state;
    const authUser = ctx.state.authUser;

    // Don't allow an superAdmin to imitate another superAdmin
    const allowedRoles = expandRoles(authUser, ctx).roles.reduce(
      (result, { roleDefinition }) => result.concat(roleDefinition.allowAuthenticationOnRoles || []),
      []
    );

    const isAllowed = [...user.roles].every(({ role }) => allowedRoles.includes(role));
    if (!isAllowed) {
      ctx.throw(403, 'You are not allowed to authenticate as this user');
    }

    const token = createImpersonateAuthToken(user, authUser, ctx);
    await authUser.save();

    await AuditEntry.append('Authenticated as user', {
      ctx,
      object: user,
      actor: authUser,
    });

    ctx.body = {
      data: {
        token,
      },
    };
  })
  .use(requirePermissions('roles.list'))
  .get('/roles', (ctx) => {
    ctx.body = {
      data: roles,
    };
  })
  .get('/permissions', (ctx) => {
    ctx.body = {
      // TODO: what is needed here?
      // data: permissions,
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
        data: data.map((item) => expandRoles(item, ctx)),
        meta,
      };
    }
  )
  .get('/:id', async (ctx) => {
    ctx.body = {
      data: expandRoles(ctx.state.user, ctx),
    };
  })
  .use(requirePermissions('users.create'))
  .post(
    '/',
    validateBody(
      User.getCreateValidation({
        password: yd.string().password(),
      })
        .custom((val) => {
          if (!val.email && !val.phone) {
            throw new Error('email or phone number is required');
          }
        })
        .custom(validateUserRoles)
    ),
    async (ctx) => {
      const { email, phone } = ctx.request.body;
      if (email && (await User.findOne({ email }))) {
        ctx.throw(400, 'A user with that email already exists');
      }
      if (phone && (await User.findOne({ phone }))) {
        ctx.throw(400, 'A user with that phone number already exists');
      }
      const user = await User.create(ctx.request.body);

      await AuditEntry.append('Created User', {
        ctx,
        object: user,
      });

      ctx.body = {
        data: user,
      };
    }
  )
  .patch('/:id', validateBody(User.getUpdateValidation().custom(validateUserRoles)), async (ctx) => {
    const { user } = ctx.state;
    const snapshot = new User(user);
    user.assign(ctx.request.body);
    await user.save();
    await AuditEntry.append('Updated user', {
      ctx,
      snapshot,
      object: user,
      fields: ['email', 'roles'],
    });

    ctx.body = {
      data: user,
    };
  })
  .delete('/:id', async (ctx) => {
    const { user } = ctx.state;
    try {
      await user.delete();
    } catch (err) {
      ctx.throw(400, err);
    }
    await AuditEntry.append('Deleted user', {
      ctx,
      object: user,
      fields: ['email', 'roles'],
    });
    ctx.status = 204;
  });

module.exports = router;
