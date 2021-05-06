// Injects environment variables into templates.
// Note that only public variables should be exposed!
const config = require('@bedrockio/config');
const { omitBy } = require('lodash');

const PUBLIC = omitBy(
  config.getAll(),
  (_, key) => key.startsWith('SERVER') || key.startsWith('HTTP')
);

module.exports = function envMiddleware() {
  const env = JSON.stringify(PUBLIC);
  return async (ctx, next) => {
    await next();
    if (ctx.type === 'text/html' && ctx.body) {
      ctx.body = ctx.body
        .toString()
        .replace(
          '<!--env:conf-->',
          `<script>window.__ENV__ = ${env};</script>`
        );
    }
  };
};
