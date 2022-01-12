const { Application } = require('../../models');

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

function isSimpleValue(value) {
  return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || value === null;
}

const protectedFields = /token|password|secret|hash|key|jwt|ping|payment|bank|iban/i;

function redact(obj, prefix) {
  Object.keys(obj).forEach(function (key) {
    const value = obj[key];
    const keyMatched = key.match(protectedFields);
    const simpleValue = isSimpleValue(value);

    if (keyMatched && simpleValue) {
      obj[key] = '[redacted]';
    } else if (keyMatched && Array.isArray(value) && typeof value[0] !== 'object') {
      obj[key] = value.map(() => '[redacted]');
    } else if (simpleValue) {
      obj[key] = value;
    } else if (Array.isArray(value)) {
      obj[key] = value.map((val) => {
        return isSimpleValue(val) ? val : redact(val);
      });
    } else if (typeof value === 'object') {
      Object.assign(obj, redact(value, key));
    }
  }, {});

  if (prefix) {
    return {
      [prefix]: obj,
    };
  }
  return obj;
}

function truncate(body) {
  if (body.data?.length > 20) {
    return {
      ...body,
      data: [...body.data.concat().splice(0, 20), `[${body.data.length - 20} items has been truncated]`],
    };
  }
  return body;
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
    if (!clientId) {
      return ctx.throw(400, 'Missing "client-id" header');
    }

    // Could be optimized by storing the application in ttl cache and batch updating the request count
    const application = await Application.findOneAndUpdate(
      { clientId },
      {
        $inc: { requestCount: 1 },
      }
    );

    if (!application) {
      return ctx.throw(404, `The "Client-Id" did not match any known applications`);
    }
    ctx.state.application = application;

    const requestId = `${application.clientId}-${nanoid()}`;
    ctx.set('Request-Id', requestId);
    const { res } = ctx;

    // fire after the response is done
    // this allows to catch the error handlers output
    res.once('finish', () => {
      const { request, response } = ctx;

      const isJSON = ctx.response.get('Content-Type')?.includes('application/json');

      ApplicationEntry.create({
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
          status: ctx.status,
          headers: sanatizesHeaders(response.headers),
          body: response.body && isJSON ? redact(truncate(JSON.parse(JSON.stringify(response.body)))) : undefined,
        },
      });
    });

    return next();
  };
}

module.exports = {
  applicationMiddleware,
};
