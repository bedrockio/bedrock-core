const { userHasAccess } = require('./../permissions');

function requirePermissions({ endpoint, level, context = 'global' }) {
  if (!endpoint || !level) {
    throw new Error('Need endpoint and level for requirePermissions');
  }
  return async (ctx, next) => {
    if (!ctx.state.authUser) {
      return ctx.throw(401, `This endpoint requires authentication`);
    }
    const target = ctx.state[context] || undefined;
    const hasAccess = await userHasAccess(ctx.state.authUser, { context, endpoint, level, target });
    if (!hasAccess) {
      return ctx.throw(
        401,
        `You don't have the right permission for endpoint ${endpoint} (required level: ${context}/${level})`
      );
    }
    return next();
  };
}

module.exports = {
  requirePermissions,
};
