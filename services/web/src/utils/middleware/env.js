const { getPublic } = require('../env');

module.exports = function envMiddleware() {

  const ENV = JSON.stringify(getPublic());

  return (ctx, next) => {
    return next().then(() => {
      if (ctx.body) {
        ctx.body = ctx.body
          .toString()
          .replace(
            '<!--env:conf-->',
            `<script>window.__ENV__ = ${ENV};</script>`
          );
      }
    });
  };
};
