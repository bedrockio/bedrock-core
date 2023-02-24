const config = require('@bedrockio/config');
const { isSchemaError } = require('@bedrockio/yada');
const ENV_NAME = config.get('ENV_NAME');

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    let { status = 500, type = 'other', message, details, expose } = err;

    if (isSchemaError(err)) {
      message = err.getFullMessage({
        delimiter: '\n',
        labels: 'natural',
      });
    }

    if (!expose) {
      if (ENV_NAME === 'production') {
        message = 'An unexpected error occurred. Please try again later.';
      }
    }

    ctx.type = 'json';
    ctx.status = status;
    ctx.body = {
      error: { type, message, status, details },
    };

    ctx.app.emit('error', err, ctx);
  }
}

module.exports = errorHandler;
