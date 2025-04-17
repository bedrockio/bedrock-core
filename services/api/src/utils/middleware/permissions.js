const { userHasAccess } = require('./../permissions');
const AuditEntry = require('../../models/audit-entry');

// This can be changed to "organization" to quickly enable
// multi-tenancy. Be sure when doing this to lock down global
// permissions such as searching all users, impersonation, etc.
const DEFAULT_SCOPE = 'global';

function requirePermissions(...args) {
  const options = resolveOptions(args);
  const { endpoint, permission, scope } = options;

  if (!endpoint) {
    throw new Error('Endpoint required.');
  } else if (!permission) {
    throw new Error('Permission required.');
  }

  const fn = async (ctx, next) => {
    const { authUser, organization } = ctx.state;

    if (!authUser) {
      return ctx.throw(401, 'This endpoint requires authentication.');
    } else if (scope === 'organization' && !organization) {
      return ctx.throw(500, 'Organization is required for permissions check.');
    }

    let allowed;
    if (scope === 'organization') {
      allowed = userHasAccess(authUser, {
        ...options,
        scopeRef: organization._id,
      });
    } else {
      allowed = userHasAccess(authUser, options);
    }

    if (allowed) {
      return next();
    } else {
      await AuditEntry.append('Permission Denied', {
        ctx,
        actor: authUser,
        attributes: {
          endpoint,
          permission,
          scope,
          scopeRef: organization ? organization._id : undefined,
        },
      });
      return ctx.throw(403, `You don't have the right permissions (required permission: ${endpoint}.${permission}).`);
    }
  };

  // Allows docs to see the permissions on the middleware
  // layer to generate an OpenApi entry for it.
  fn.permissions = {
    endpoint,
    permission,
    scope,
  };
  return fn;
}

function resolveOptions(args) {
  let options;
  if (typeof args[0] === 'string') {
    const [endpoint, permission] = args[0].split('.');
    options = {
      endpoint,
      permission,
      scope: args[1],
    };
  } else {
    options = args[0];
  }

  return {
    scope: DEFAULT_SCOPE,
    ...options,
  };
}

module.exports = {
  requirePermissions,
};
