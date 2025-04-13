const { Application } = require('../../models');

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
  const result = {};
  for (let [key, value] of Object.entries(obj || {})) {
    const keyMatched = key.match(protectedFields);
    const simpleValue = isSimpleValue(value);

    if (keyMatched && simpleValue) {
      result[key] = '[redacted]';
    } else if (keyMatched && Array.isArray(value) && typeof value[0] !== 'object') {
      result[key] = value.map(() => '[redacted]');
    } else if (simpleValue) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map((val) => {
        return isSimpleValue(val) ? val : redact(val);
      });
    } else if (typeof value === 'object') {
      Object.assign(result, redact(value, key));
    }
  }

  if (prefix) {
    return {
      [prefix]: result,
    };
  }
  return result;
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

    const apiKey = ctx.get('api-key');

    if (!apiKey) {
      return next();
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
      // Response body is assumed to be serialized.
      responseBody = redact(truncate(response.body));
    }
  };
}

module.exports = {
  applicationMiddleware,
};
