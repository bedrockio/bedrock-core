import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { fetchByParam, isSelf } from '../utils/middleware/params.js';
import { validateBody } from '../utils/middleware/validate.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { requirePermissions } from '../utils/middleware/permissions.js';

import { csvExport } from '../utils/csv.js';
import { createImpersonateAuthToken } from '../utils/tokens.js';
import { expandRoles, validateUserRoles } from '../utils/permissions.js';
import documentation from '../utils/documentation.js';
import { User } from '../models/index.js';

import roles from '../roles.json' with { type: 'json' };

import { AuditEntry } from '../models/index.js';

const router = new Router();

router
  .use(authenticate())
  .param('id', fetchByParam(User))
  .get(
    '/me',
    isSelf,
    documentation.include(
      documentation.description(
        'Get Self',
        'Returns the authenticated user with each role expanded to its definition.',
      ),
      documentation.success(200, {
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;
      ctx.body = {
        data: expandRoles(authUser, ctx),
      };
    },
  )
  .patch(
    '/me',
    isSelf,
    validateBody(User.getUpdateValidation()),
    documentation.include(
      documentation.description(
        'Update Self',
        'Updates the authenticated user and returns it with each role expanded.',
      ),
      documentation.success(200, {
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;
      authUser.assign(ctx.request.body);
      await authUser.save();
      ctx.body = {
        data: expandRoles(authUser, ctx),
      };
    },
  )
  .post(
    '/:id/authenticate',
    requirePermissions('users.impersonate'),
    documentation.include(
      documentation.description('Impersonate User', 'Issues a short-lived token that authenticates as the given user.'),
      documentation.success(200, {
        schema: { data: { token: yd.string() } },
        example: { data: { token: 'eyJhbGciOi...' } },
      }),
      documentation.error(
        403,
        'The user holds a role that none of your roles lists in `allowAuthenticationOnRoles`, such as another super admin.',
      ),
    ),
    async (ctx) => {
      const { user } = ctx.state;
      const authUser = ctx.state.authUser;

      // Don't allow an superAdmin to imitate another superAdmin
      const allowedRoles = expandRoles(authUser, ctx).roles.reduce(
        (result, { roleDefinition }) => result.concat(roleDefinition.allowAuthenticationOnRoles || []),
        [],
      );

      const isAllowed = [...user.roles].every(({ role }) => allowedRoles.includes(role));
      if (!isAllowed) {
        ctx.throw(403, 'You are not allowed to authenticate as this user');
      }

      const token = createImpersonateAuthToken(ctx, user, authUser);
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
    },
  )
  .use(requirePermissions('roles.list'))
  .get(
    '/roles',
    documentation.include(
      documentation.description('List Roles', 'Returns every role definition that can be assigned to users.'),
      documentation.success(200, {
        schema: {
          data: [
            {
              id: yd.string(),
              name: yd.string(),
              allowScopes: yd.array(yd.string()),
              permissions: yd.object(),
              allowAuthenticationOnRoles: yd.array(yd.string()),
            },
          ],
        },
        example: {
          data: [
            {
              id: 'admin',
              name: 'Admin',
              allowScopes: ['global'],
              permissions: { users: 'all' },
            },
          ],
        },
      }),
    ),
    (ctx) => {
      ctx.body = {
        data: Object.keys(roles).map((id) => {
          return {
            id,
            ...roles[id],
          };
        }),
      };
    },
  )
  .get(
    '/permissions',
    documentation.include(
      documentation.description('List Permissions', 'Placeholder that currently returns an empty object.'),
      documentation.success(200, {
        schema: {},
        example: {},
      }),
    ),
    (ctx) => {
      ctx.body = {
        // TODO: what is needed here?
        // data: permissions,
      };
    },
  )
  .post(
    '/search',
    validateBody(
      User.getSearchValidation({
        allowExport: true,
      }),
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
    },
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
      User.getCreateValidation()
        .append({
          password: yd.string().password(),
        })
        .custom((val) => {
          if (!val.email && !val.phone) {
            throw new Error('email or phone number is required');
          }
        })
        .custom(validateUserRoles),
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
    },
  )
  .patch('/:id', validateBody(User.getUpdateValidation().custom(validateUserRoles)), async (ctx) => {
    const { user } = ctx.state;
    const snapshot = new User(user);
    user.assign(ctx.request.body);
    await user.save();
    await AuditEntry.append('Updated User', {
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

export default router;
