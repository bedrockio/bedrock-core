const Sentry = require('@sentry/node');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const errorStatus = Number.isInteger(err.status) ? err.status : 500;
    ctx.status = errorStatus;
    if (err.isJoi) {
      ctx.body = {
        error: {
          message: err.details[0].message,
          details: err.details
        }
      };
    } else {
      if (ctx.status === 500) {
        Sentry.captureException(err);
      }
      ctx.body = {
        error: {
          message: err.message
        }
      };
    }
    ctx.app.emit('error', err, ctx);
  }
};
