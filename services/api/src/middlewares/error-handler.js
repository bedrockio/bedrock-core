const Sentry = require('@sentry/node');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {

    const status = Number.isInteger(err.status) ? err.status : 500;
    const body = err.isJoi ? err.details[0].message : err.message;

    if (status === 500) {
      Sentry.captureException(err);
    }
    ctx.body = body;
    ctx.status = status;
    ctx.app.emit('error', err, ctx);
  }
};
