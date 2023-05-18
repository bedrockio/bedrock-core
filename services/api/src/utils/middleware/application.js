const { Application } = require('../../models');

const { ApplicationRequest } = require('../../models');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 16);

function sanitizeHeaders(headers) {
  const sanatized = {};
  Object.keys(headers).forEach((key) => {
    sanatized[key.toLowerCase()] = headers[key];
  });

  if (sanatized.authorization && /^bearer/i.test(sanatized.authorization.trim())) {
    sanatized.authorization = 'Bearer [redacted]';
  }

  return sanatized;
}

function isSimpleValue(value) {
  const type = typeof value;
  return type === 'number' || type === 'string' || type === 'boolean' || value === null;
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
  if (body.data?.length > 20 && Array.isArray(body.data)) {
    return {
      ...body,
      data: [...body.data.concat().splice(0, 20), `[${body.data.length - 20} items has been truncated]`],
    };
  }
  return body;
}

function applicationMiddleware({ router, ignorePaths = [] }) {
  return async (ctx, next) => {
    const path = ctx.url;

    // if no route is matched, dont check anything
    const isPathIgnored = ignorePaths.find((ignorePath) => {
      if (ignorePath instanceof RegExp) {
        return ignorePath.test(path);
      }
      return ignorePath === path;
    });

    if (isPathIgnored) {
      return next();
    }

    const apiKey = ctx.get('apikey') || ctx.get('api-key') || ctx.get('api_key');
    if (!apiKey) {
      // check that we hit a route otherwise we dont care
      if (!router.match(ctx.path, ctx.method).match) {
        return next();
      }
      return ctx.throw(400, 'Missing "ApiKey" header');
    }

    const application = await Application.findOneAndUpdate(
      { apiKey },
      {
        $inc: { requestCount: 1 },
      }
    );

    if (!application) {
      return ctx.throw(400, `The "ApiKey" did not match any known applications`);
    }

    const requestId = `${application.apiKey}-${nanoid()}`;
    ctx.set('Request-Id', requestId);

    await next();

    const { request, response } = ctx;

    let responseBody;
    if (response.get('Content-Type')?.includes('application/json')) {
      // this is bit unlucky
      // we need to stringify the doc to avoid having all kind of prototypes / bson id / other mongonse wrappers
      // perhaps its worth considering https://developer.mozilla.org/en-US/docs/Web/API/structuredClone when move to node 17+
      const convertBody = JSON.parse(JSON.stringify(response.body));
      responseBody = redact(truncate(convertBody));
    }

    // This could be done as upsert
    await ApplicationRequest.create({
      application: application.id,
      routeNormalizedPath: ctx.routerPath,
      requestId,
      request: {
        sessionId: ctx.state.jwt?.jti,
        ip: request.ip,
        method: request.method,
        path: request.url,
        body: request.body ? redact(request.body) : undefined,
        headers: sanitizeHeaders(request.headers),
      },
      response: {
        status: ctx.status,
        headers: sanitizeHeaders(response.headers),
        body: responseBody,
      },
    });
  };
}

module.exports = {
  applicationMiddleware,
};
