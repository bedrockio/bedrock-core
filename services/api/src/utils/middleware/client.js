const { Application } = require('../../models');
const config = require('@bedrockio/config');
const enabled = config.get('ENV_NAME') !== 'test';

function fetchClient({ ignorePaths = [] }) {
  return async (ctx, next) => {
    if (ignorePaths.includes(ctx.request.path)) return next();

    const clientId = ctx.request.get('client') || '';
    if (!clientId && enabled) {
      return ctx.throw(400, `Missing Client header`);
    }

    // Could be optimized by storing the application in ttl cache and batch updating the request count
    const application = await Application.findOneAndUpdate(
      { clientId },
      {
        $inc: { requestCount: 1 },
      }
    );

    if (!application && enabled) {
      return ctx.throw(404, `Client did not match any known applications`);
    }
    ctx.state.application = application;
    return next();
  };
}

module.exports = fetchClient;
