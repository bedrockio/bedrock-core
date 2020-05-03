// Redirects all traffic over HTTP to HTTPS with the correct headers.

module.exports = function redirectHttpsMiddleware(ctx, next) {
  if (ctx.secure) return next();
  if (ctx.get('x-forwarded-proto') === 'https') {
    return next();
  }

  if (ctx.protocol === 'http' && ctx.headers.host) {
    ctx.status = 301;
    return ctx.redirect(`https://${ctx.headers.host}${ctx.url}`);
  }
  return next();
};
