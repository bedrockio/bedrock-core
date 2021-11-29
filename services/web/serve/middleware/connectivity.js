module.exports = function connectivityCheck(ctx, next) {
  if (ctx.path === '/w/connectivity' && ctx.method === 'POST') {
    ctx.status = 204;
    return;
  }
  return next();
};
