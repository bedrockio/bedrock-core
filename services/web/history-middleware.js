const url = require('url');

module.exports = function historyApiMiddleware(options = {}) {
  return function historyApi(ctx, next) {
    if (ctx.method !== 'GET') return next();
    if (
      typeof ctx.headers.accept !== 'string' ||
      ctx.headers.accept.indexOf('text/html') === -1 ||
      ctx.headers.accept.indexOf('*/*') === -1
    ) {
      return next();
    }

    const parsedUrl = url.parse(ctx.url);
    if (parsedUrl.pathname.indexOf('.') !== -1) return next();
    ctx.url = options.index;
    return next();
  };
};
