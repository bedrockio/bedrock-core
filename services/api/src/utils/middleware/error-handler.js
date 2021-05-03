const config = require('@bedrockio/config');

const ENV_NAME = config.get('ENV_NAME');

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    let { status, message, details, expose } = err;

    // `expose` is set if the error is triggered via ctx.throw or ctx.assert
    // if its not set => assume its 3 party error and should trigger a 500
    if (!expose || !status) {
      if (ENV_NAME === 'production') {
        message = 'An unexpected error occurred. Please try again later.';
      }
    }

    if (err.isJoi) {
      message = details.map((d) => d.message).join('\n');
    }

    ctx.type = 'json';
    ctx.status = status || 500;
    ctx.body = {
      error: { message, status, details },
    };

    ctx.app.emit('error', err, ctx);
  }
}

module.exports = errorHandler;
