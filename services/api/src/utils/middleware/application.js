const { Application } = require('../../models');
const config = require('@bedrockio/config');
const enabled = config.get('ENV_NAME') !== 'test';

function fetchApplication({ ignorePaths = [] }) {
  return async (ctx, next) => {
    const path = ctx.url;
    const isPathIgnored = ignorePaths.find((ignorePath) => {
      if (ignorePath instanceof RegExp) {
        return ignorePath.test(path);
      }

      return ignorePath === path;
    });

    if (isPathIgnored) {
      return next();
    }

    const clientId = ctx.request.get('client-id') || '';
    if (!clientId && enabled) {
      return ctx.throw(400, 'Missing "client-id" header');
    }

    // Could be optimized by storing the application in ttl cache and batch updating the request count
    const application = await Application.findOneAndUpdate(
      { clientId },
      {
        $inc: { requestCount: 1 },
      }
    );

    if (!application && enabled) {
      return ctx.throw(404, `The "Client-Id" did not match any known applications`);
    }
    ctx.state.application = application;
    return next();
  };
}

module.exports = fetchApplication;
