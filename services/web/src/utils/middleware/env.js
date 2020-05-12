// Injects environment variables into templates.
// Note that only public variables should be exposed!

module.exports = function envMiddleware(env) {
  env = JSON.stringify(env);
  return (ctx, next) => {
    return next().then(() => {
      if (ctx.body) {
        ctx.body = ctx.body
          .toString()
          .replace(
            '<!--env:conf-->',
            `<script>window.__ENV__ = ${env};</script>`
          );
      }
    });
  };
};
