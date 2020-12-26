const pino = require('pino');
const config = require('@bedrockio/config');

const tracer = require('./tracer');
const startTime = Symbol('startTime');

function getGlobalContext() {
  const currentSpan = tracer.getCurrentSpan();
  if (!currentSpan) return null;
  return currentSpan.context();
}

const parentLogger = pino({
  messageKey: 'message',
  formatters: {
    level(_, level) {
      if (level === 20) {
        return { severity: 'debug' };
      }
      if (level === 30) {
        return { severity: 'info' };
      }
      if (level === 40) {
        return { severity: 'warning' };
      }
      if (level === 50) {
        return { severity: 'error' };
      }
      if (level >= 60) {
        return { severity: 'critical' };
      }
      return { severity: 'default' };
    },
  },
  base: null,
  level: config.get('LOG_LEVEL'),
  timestamp: pino.stdTimeFunctions.isoTime,
  prettyPrint: process.env.NODE_ENV === 'dev' ? { messageKey: 'message' } : false,
});

function formatCurrentTrace({ traceId, spanId }) {
  return {
    'logging.googleapis.com/spanId': spanId,
    'logging.googleapis.com/trace': traceId,
    'logging.googleapis.com/trace_sampled': true,
  };
}

const formatters = {
  gcloud: function ({ request, response, latency }) {
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
    return Object.assign({
      message: `${request.method} ${request.url} ${response.getHeader('content-length')} - ${latency}ms`,
      httpRequest: {
        requestMethod: request.method.toUpperCase(),
        requestUrl: request.url,
        requestSize: request.headers['content-length'],
        status: response.statusCode,
        userAgent: request.headers['user-agent'],
        referer: request.headers['referer'],
        remoteIp: request.headers['x-forwarded-for'],
        latency: `${Math.floor(latency / 1e3)}.${Math.floor(latency % 1e3)}s`,
        protocol: request.headers['x-forwarded-proto'],
        responseSize: response.getHeader && response.getHeader('content-length'),
      },
    });
  },
};

exports.loggingMiddleware = function loggingMiddleware({
  useLevel = 'info',
  ignoreUserAgents = ['GoogleHC/1.0'],
  httpRequestFormat = formatters.gcloud,
}) {
  function onResFinished(loggerInstance, request, response, error) {
    const latency = Date.now() - response[startTime];
    const isError = response.statusCode == 500 || !!error;

    loggerInstance[isError ? 'error' : useLevel](
      httpRequestFormat({
        response,
        request,
        latency: latency,
      }),
      error
    );
  }

  function loggingMiddlewareInner(ctx, next) {
    const res = ctx.res;
    const req = ctx.req;

    res[startTime] = res[startTime] || Date.now();

    // context only works in prod, as the context is trace based
    const context = process.env.NODE_ENV === 'production' && getGlobalContext();

    // if the tracer is ignoring certain urls then it wont be available
    const globalFields = context ? formatCurrentTrace(context) : {};

    const requestLogger = parentLogger.child({
      ...globalFields,
    });

    ctx.logger = requestLogger;

    if (ignoreUserAgents.includes(req.headers['user-agent'])) {
      return next();
    }

    res.once('finish', () => onResFinished(requestLogger, req, res));
    res.once('error', (err) => onResFinished(requestLogger, req, res, err));

    return next();
  }
  return loggingMiddlewareInner;
};

/**
 * @returns {import('pino').Logger} Logger
 */
exports.createLogger = function createLogger(options) {
  const globalContext = getGlobalContext();

  const globalContextFields = globalContext ? formatCurrentTrace(globalContext) : {};

  return parentLogger.child({
    ...globalContextFields,
    ...options,
  });
};

exports.logger = parentLogger;
