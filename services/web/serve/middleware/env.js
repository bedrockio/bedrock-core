// Injects environment variables into templates.
// Note that only public variables should be exposed!
import config from '@bedrockio/config';

function omitBy(object, predicate) {
  return Object.fromEntries(
    Object.entries(object).filter(([key, value]) => !predicate(value, key)),
  );
}

const PUBLIC = omitBy(
  config.getAll(),
  (_, key) => key.startsWith('SERVER') || key.startsWith('HTTP'),
);

const ENV_REG = /(?:<!-- |{{)env:(\w+)(?: -->|}})/g;

export default function envMiddleware() {
  const env = JSON.stringify(PUBLIC);
  return async (ctx, next) => {
    await next();
    if (ctx.type === 'text/html' && ctx.body) {
      ctx.body = ctx.body.toString().replace(ENV_REG, (all, name) => {
        if (name === 'conf') {
          return `<script>window.__ENV__ = ${env};</script>`;
        } else {
          return PUBLIC[name] || '';
        }
      });
    }
  };
}
