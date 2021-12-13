const { Application } = require('../../models');

function fetchApplication() {
  return async (ctx, next) => {
    const clientId = ctx.request.get('clientId') || '';
    if (!clientId) {
      return ctx.throw(400, `Missing clientId header`);
    }

    // Could be optimized by storing the application in ttl cache and batch updating the request count
    const application = await Application.findOneAndUpdate(
      { clientId },
      {
        $inc: { requestCount: 1 },
      },
      {
        upsert: true,
      }
    );
    if (!application) {
      return ctx.throw(404, `clientId did not match any known applications`);
    }
    application.ctx.state.application = application;
    return next();
  };
}

module.exports = {
  fetchApplication,
};
