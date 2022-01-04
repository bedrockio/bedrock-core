const { Application } = require('../../models');
const config = require('@bedrockio/config');
const ENV_NAME = config.get('ENV_NAME');

const { ApplicationEntry } = require('../../models');
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

function redact(obj, prefix) {
  const result = Object.keys(obj).reduce(function (acc, key) {
    const value = obj[key];
    const keyMatched = key.match(/token|password|secret|hash/);

    if (keyMatched && (typeof value === 'number' || typeof value === 'string')) {
      acc[key] = '[redacted]';
    } else if (keyMatched && Array.isArray(value) && typeof value[0] !== 'object') {
      acc[key] = value.map(() => '[redacted]');
    } else if (Array.isArray(value)) {
      acc[key] = value.map((object) => redact(object));
    } else if (typeof value === 'object') {
      Object.assign(acc, redact(value, key));
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});

  if (prefix) {
    return {
      [prefix]: result,
    };
  }
  return result;
}

function applicationMiddleware({ ignorePaths = [] }) {
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

    const requestId = `${application.clientId}-${nanoid()}`;
    ctx.set('Request-Id', requestId);
    const { request, response } = ctx;

    await ApplicationEntry.create({
      application: application.id,
      routeNormalizedPath: ctx.routerPath,
      routePrefix: ctx.router?.opts.prefix,
      requestId,
      request: {
        ip: request.ip,
        method: request.method,
        url: request.url,
        body: request.body ? redact(request.body) : undefined,
        headers: sanatizesHeaders(request.headers),
      },
      response: {
        status: response.status,
        headers: sanatizesHeaders(response.headers),
        body: response.body ? redact(response.body) : undefined,
      },
    });
  };
}

module.exports = {
  applicationMiddleware,
};
