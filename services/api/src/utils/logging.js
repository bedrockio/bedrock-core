const pino = require('pino');
const config = require('@bedrockio/config');
const { floor } = require('lodash');

const tracer = require('./tracer');

function getTracerContext() {
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
  level: config.get('LOG_LEVEL') || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

function formatCurrentTrace({ traceId, spanId }) {
  return {
    'logging.googleapis.com/spanId': spanId,
    'logging.googleapis.com/trace': traceId,
    'logging.googleapis.com/trace_sampled': true,
  };
}

/**
 * @returns {import('pino').Logger} Logger
 */
function createLogger(options = {}) {
  const globalContext = getTracerContext();
  const globalContextFields = globalContext ? formatCurrentTrace(globalContext) : {};

  return parentLogger.child({
    ...globalContextFields,
    ...options,
  });
}

exports.createLogger = createLogger;

const formatters = {
  // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
  gcloud: function ({ request, response, latency }) {
    return {
      message: `${request.method} ${request.url} ${response.getHeader('content-length')} - ${latency}ms`,
      httpRequest: {
        requestMethod: request.method.toUpperCase(),
        requestUrl: request.url,
        requestSize: request.headers['content-length'],
        status: response.statusCode,
        userAgent: request.headers['user-agent'],
        referer: request.headers['referer'],
        remoteIp: request.headers['x-forwarded-for'],
        latency: `${floor(latency / 1000, 3)}s`,
        protocol: request.headers['x-forwarded-proto'],
        responseSize: response.getHeader('content-length'),
      },
    };
  },
};

function onResFinished(loggerInstance, httpRequestFormat, startTime, request, response, error) {
  const latency = Date.now() - startTime;
  const isError = response.statusCode == 500 || !!error;

  loggerInstance[isError ? 'error' : 'info'](
    httpRequestFormat({
      response,
      request,
      latency: latency,
    }),
    error
  );
}

exports.loggingMiddleware = function loggingMiddleware(options = {}) {
  const { httpRequestFormat, ignoreUserAgents } = {
    ignoreUserAgents: ['GoogleHC/1.0', 'kube-probe/1.16+'],
    httpRequestFormat: formatters.gcloud,
    ...options,
  };

  function loggingMiddlewareInner(ctx, next) {
    const res = ctx.res;
    const req = ctx.req;

    const startTime = Date.now();
    const requestLogger = createLogger();

    ctx.logger = requestLogger;

    if (ignoreUserAgents.includes(ctx.request.get('user-agent'))) {
      return next();
    }

    res.once('finish', () => onResFinished(requestLogger, httpRequestFormat, startTime, req, res));
    res.once('error', (err) => onResFinished(requestLogger, httpRequestFormat, startTime, req, res, err));

    return next();
  }
  return loggingMiddlewareInner;
};

exports.logger = parentLogger;
