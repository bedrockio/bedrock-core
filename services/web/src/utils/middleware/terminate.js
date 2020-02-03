// Middleware to allow selectively terminating the middleware
// chain based on a URL prefix. We are currently using this to
// prevent other downstream middlewares from running for anything
// matching the /assets/ URL.
//
// This is intended to replicate the behavior of using koa-mount
// and koa-static to selectively serve assets on production without
// having to hard-code a check on the URL. It also has the benefit
// that all other downstream middlewares will not have to perform
// a check to ensure that they are not static asset requests.
module.exports = function terminateMiddleware(path, last) {
  return (ctx, next) => {
    if (ctx.path.indexOf(path) === 0) {
      return last(ctx, () => {});
    }
    return next();
  };
};
