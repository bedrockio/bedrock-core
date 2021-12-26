const { ApplicationEntry } = require('../../models');
const { omit } = require('lodash');

function sanatizesHeaders(headers) {
  const sanatized = {
    ...headers,
  };

  if (sanatized.Authorization && sanatized.Authorization.includes('Bearer')) {
    sanatized.Authorization = 'Bearer [redacted]';
  }
  return sanatized;
}

function sanatizesRequestBody(body, protectedFields = ['password', 'secret', 'token']) {
  const sanatized = {};
  Object.keys(body).forEach((key) => {
    sanatized[key] = protectedFields.includes(key) ? '[redacted]' : sanatized[key];
  });
  return sanatizesRequestBody;
}

function sanatizeResponseBody(body) {
  const projectedFields = body[Symbol.for('protected')] || [];
  return omit(body, projectedFields);
}

function applicationLogger() {
  return async (ctx, next) => {
    await next();
    const application = ctx.state.application;
    if (!application) {
      return;
    }
    const { request, response } = ctx;
    await ApplicationEntry.create({
      application: application.id,
      routeNormalizedPath: ctx.routerPath,
      routePrefix: ctx.router.opts.prefix,
      source: request.get('User-Agent'),
      request: {
        ip: request.ip,
        method: request.method,
        body: sanatizesRequestBody(request.body),
        headers: sanatizesHeaders(request.headers),
        url: request.url,
      },
      response: {
        status: response.status,
        headers: sanatizesHeaders(response.headers),
        body: sanatizeResponseBody(response.body),
      },
    });
  };
}

module.exports = applicationLogger;
