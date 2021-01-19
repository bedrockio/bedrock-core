const { userHasAccess } = require('./../permissions');

function requirePermissions({ endpoint, permission, scope = 'global' }) {
  if (!endpoint || !permission) {
    throw new Error('Need endpoint and permission for requirePermissions');
  }
  return async (ctx, next) => {
    if (!ctx.state.authUser) {
      return ctx.throw(401, `This endpoint requires authentication`);
    }
    const scopeRef = ctx.state[scope] || undefined;
    const hasAccess = userHasAccess(ctx.state.authUser, { scope, endpoint, permission, scopeRef });
    if (!hasAccess) {
      return ctx.throw(
        401,
        `You don't have the right permission for endpoint ${endpoint} (required permission: ${scope}/${permission})`
      );
    }
    return next();
  };
}

module.exports = {
  requirePermissions,
};
