const { userHasAccess } = require('./../permissions');

function requirePermissions({ endpoint, permission, scope = 'global' }) {
  if (!endpoint || !permission) {
    throw new Error('Need endpoint and permission for requirePermissions');
  }
  return async (ctx, next) => {
    if (!ctx.state.authUser) {
      return ctx.throw(401, `This endpoint requires authentication`);
    }
    const hasGlobalAccess = userHasAccess(ctx.state.authUser, { scope: 'global', endpoint, permission });
    if (scope === 'organization') {
      if (hasGlobalAccess) return next();
      const organization = ctx.state.organization;
      const hasOrganizationAccess = userHasAccess(ctx.state.authUser, {
        scope: 'organization',
        endpoint,
        permission,
        scopeRef: organization._id,
      });
      if (hasOrganizationAccess) return next();
    } else if (scope === 'global') {
      if (hasGlobalAccess) return next();
    }
    return ctx.throw(
      401,
      `You don't have the right permission for endpoint ${endpoint} (required permission: ${scope}/${permission})`
    );
  };
}

module.exports = {
  requirePermissions,
};
