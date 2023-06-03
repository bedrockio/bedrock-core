const { serializeObject } = require('../serialize');

async function serialize(ctx, next) {
  await next();
  // Setting ctx.body always results in a 204 so only
  // proceed with serialize if it has been set.
  if (ctx.body) {
    ctx.body = serializeObject(ctx.body, ctx);
  }
}

module.exports = serialize;
