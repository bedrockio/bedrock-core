const { serializeObject } = require('../serialize');

async function serialize(ctx, next) {
  await next();
  ctx.body = serializeObject(ctx.body, ctx);
}

module.exports = serialize;
