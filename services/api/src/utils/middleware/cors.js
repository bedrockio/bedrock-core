const cors = require('@koa/cors');

// Note: "allowedOrigins" can be passed into the options here to
// enable whitelisting domains here for added security layer.
//
// This is off by default, which simply reflects the Origin header
// in Access-Control-Allow-Origin, however note that this opens up
// the API to any origin.
//
// Also note that although modern browsers will not allow the Origin
// header to be overridden it is still possible to spoof.

const DEFAULTS = {
  exposeHeaders: ['content-length', 'content-disposition'],
  maxAge: 600,
};

function restrictOrigins(allowed) {
  return (ctx) => {
    const origin = ctx.get('Origin');
    if (allowed.includes(origin)) {
      return origin;
    } else {
      ctx.logger.warn(`Invalid Origin header for CORS request: ${origin}.`);
      return allowed[0];
    }
  };
}

module.exports = function (options = {}) {
  const { allowedOrigins, ...corsOptions } = options;
  return cors({
    origin: allowedOrigins ? restrictOrigins(allowedOrigins) : null,
    ...DEFAULTS,
    ...corsOptions,
  });
};
