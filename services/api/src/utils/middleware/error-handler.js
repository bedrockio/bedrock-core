const config = require('@bedrockio/config');

const ENV_NAME = config.get('ENV_NAME');

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    let { status, message, details } = err;

    if (!status) {
      status = 500;
      if (ENV_NAME === 'production') {
        message = 'An unexpected error occurred. Please try again later.';
      }
    }
    if (err.isJoi) {
      message = details.map((d) => d.message).join('\n');
    }

    ctx.type = 'json';
    ctx.status = status;
    ctx.body = {
      error: { message, status, details },
    };

    ctx.app.emit('error', err, ctx);
  }
}

module.exports = errorHandler;
