module.exports = function healthCheckMiddleware(ctx, next) {
  if (ctx.headers['user-agent'] === 'GoogleHC/1.0') {
    const split = ctx.headers['user-agent'].split('/');
    if (split[0] === 'GoogleHC') {
      ctx.body = 'OK';
      return;
    }
  }
  return next();
};
