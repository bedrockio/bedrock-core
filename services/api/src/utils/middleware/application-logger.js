const { ApplicationEntry } = require('../../models');
const { omit } = require('lodash');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 16);

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
  const sanatized = { ...body };
  const projectedFields = body[Symbol.for('protected')] || [];
  if (Array.isArray(sanatized.data) && sanatized.data.length > 10) {
    sanatized.data = sanatized.data.slice(0, 10);
    sanatized.__truncated__ = {
      data: {
        length: sanatized.data.length,
      },
    };
  }
  return omit(sanatized, projectedFields);
}

function applicationLogger() {
  return async (ctx, next) => {
    await next();
    const application = ctx.state.application;
    if (!application) {
      return;
    }

    const requestId = `${application.clientId}_${nanoid()}`;
    ctx.set('Request-Id', requestId);
    const { request, response } = ctx;
    await ApplicationEntry.create({
      application: application.id,
      routeNormalizedPath: ctx.routerPath,
      routePrefix: ctx.router.opts.prefix,
      requestId,
      request: {
        ip: request.ip,
        method: request.method,
        url: request.url,
        body: sanatizesRequestBody(request.body),
        headers: sanatizesHeaders(request.headers),
      },
      response: {
        status: response.status,
        body: sanatizeResponseBody(response.body),
        headers: sanatizesHeaders(response.headers),
      },
    });
  };
}

module.exports = applicationLogger;
