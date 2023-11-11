const compose = require('koa-compose');
const { koaBody } = require('koa-body');

module.exports = function () {
  return compose([
    koaBody({
      multipart: true,
    }),
    parseMultipartBody(),
  ]);
};

// Multipart bodies are assumed to be simple key/value pairs.
// This middleware parses each field as JSON to allow the client
// to send files and JSON data in the same request.
function parseMultipartBody() {
  return async (ctx, next) => {
    if (ctx.request.files) {
      for (let [key, value] of Object.entries(ctx.request.body)) {
        ctx.request.body[key] = JSON.parse(value);
      }
    }
    return next();
  };
}
