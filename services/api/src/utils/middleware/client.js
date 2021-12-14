const { Application } = require('../../models');

function fetchClient() {
  return async (ctx, next) => {
    const clientId = ctx.request.get('client') || '';
    if (!clientId) {
      return ctx.throw(400, `Missing Client header`);
    }

    // Could be optimized by storing the application in ttl cache and batch updating the request count
    const application = await Application.findOneAndUpdate(
      { clientId },
      {
        $inc: { requestCount: 1 },
      }
    );

    if (!application) {
      return ctx.throw(404, `Client did not match any known applications`);
    }
    ctx.state.application = application;
    return next();
  };
}

module.exports = fetchClient;
