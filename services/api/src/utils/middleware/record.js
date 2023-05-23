// Records API requests/responses to OpenApi definition.

const { recordRequest } = require('../openapi');

async function record(ctx, next) {
  if (ctx.get('Api-Record')) {
    try {
      await next();
    } finally {
      await recordRequest(ctx);
    }
  } else {
    return next();
  }
}

module.exports = record;
