const cors = require('@koa/cors');
const config = require('@bedrockio/config');

// Note: Whitelisting domains here for added security layer.
// To simply reflect the Origin header for a CORS response this
// option may be removed, however this opens up the API to any
// origin.
//
// Also note that although modern browsers will not allow this
// header to be overridden it is still possible to spoof.

const ALLOWED_ORIGINS = [config.get('APP_URL')];

const DEFAULTS = {
  origin: (ctx) => {
    const origin = ctx.get('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    } else {
      ctx.logger.warn(`Invalid Origin header for CORS request: ${origin}.`);
      return ALLOWED_ORIGINS[0];
    }
  },
  exposeHeaders: ['content-length'],
  maxAge: 600,
};

module.exports = function (options = {}) {
  return cors({
    ...DEFAULTS,
    ...options,
  });
};
