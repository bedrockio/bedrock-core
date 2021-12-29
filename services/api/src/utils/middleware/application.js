const { Application } = require('../../models');
const config = require('@bedrockio/config');
const enabled = config.get('ENV_NAME') !== 'test';

const { ApplicationEntry } = require('../../models');
const { omit, set } = require('lodash');
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
  if (!body) return undefined;
  // clone body to avoid changing response when redacting
  const sanatized = JSON.parse(JSON.stringify(body));
  const projectedFields = body[Symbol.for('protected')] || [];
  if (Array.isArray(sanatized.data) && sanatized.data.length > 10) {
    sanatized.data = sanatized.data.slice(0, 10);
    sanatized.__truncated__ = {
      data: {
        length: sanatized.data.length,
      },
    };
  }
  projectedFields.forEach((field) => {
    set(sanatized, field, '[redacted]');
  });

  return sanatized;
}

function fetchApplication({ ignorePaths = [] }) {
  return async (ctx, next) => {
    const path = ctx.url;
    const isPathIgnored = ignorePaths.find((ignorePath) => {
      if (ignorePath instanceof RegExp) {
        return ignorePath.test(path);
      }
      return ignorePath === path;
    });

    if (isPathIgnored) {
      return next();
    }

    const clientId = ctx.request.get('client-id') || '';
    if (!clientId && enabled) {
      return ctx.throw(400, 'Missing "client-id" header');
    }

    // Could be optimized by storing the application in ttl cache and batch updating the request count
    const application = await Application.findOneAndUpdate(
      { clientId },
      {
        $inc: { requestCount: 1 },
      }
    );

    if (!application && enabled) {
      return ctx.throw(404, `The "Client-Id" did not match any known applications`);
    }
    ctx.state.application = application;

    await next();

    const requestId = `${application.clientId}_${nanoid()}`;
    ctx.set('Request-Id', requestId);
    const { request, response } = ctx;

    try {
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
          headers: sanatizesHeaders(response.headers),
          body: sanatizeResponseBody(ctx.response.body),
        },
      });
      console.log(1);
    } catch (e) {
      console.error(e);
    }
  };
}

module.exports = fetchApplication;
