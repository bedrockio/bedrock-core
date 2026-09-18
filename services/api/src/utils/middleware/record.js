// Records API requests/responses to OpenApi definition.

import { recordRequest } from '../openapi.js';

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

export default record;
