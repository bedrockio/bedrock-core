const compose = require('koa-compose');
const { koaBody } = require('koa-body');

const unparsed = Symbol.for('unparsedBody');

function composeMiddlewares() {
  return compose([
    koaBody({
      multipart: true,
      includeUnparsed: true,
    }),
    includeRawBody(),
    parseMultipartBody(),
  ]);
}

// Allow koa body to parse the body first, then pull
// out a reference to the raw body and add it to request
// as it may be lost if other middleware (such as validate)
// overwrite the body.
function includeRawBody() {
  return async (ctx, next) => {
    ctx.request.rawBody = ctx.request.body[unparsed];
    return next();
  };
}

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

module.exports = composeMiddlewares;
