// Selectively terminates the middleware chain based on a URL prefix.
// This is useful to prevent webpack-dev-middleware from running for
// anything matching a specific URL, for example /assets/.

module.exports = function terminateMiddleware(path, last) {
  return (ctx, next) => {
    if (ctx.path.indexOf(path) === 0) {
      return last(ctx, () => {});
    }
    return next();
  };
};
