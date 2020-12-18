const tracer = require('./tracer');

const startTime = Symbol('startTime');
const isLive = process.env.NODE_ENV == 'production';

const pinoFn = require('pino');

function getGlobalContext() {
  const currentSpan = tracer.getCurrentSpan();
  if (!currentSpan) return null;
  return currentSpan.context();
}

const parentLogger = pinoFn({
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
  timestamp: pinoFn.stdTimeFunctions.isoTime,
  prettyPrint: process.env.NODE_ENV === 'dev' ? { messageKey: 'message' } : false,
});

/**
 * A LogEntry
 * @typedef {{request: import('http').IncomingMessage, response: import('http').ServerResponse, latency: number }} LogEntry
 */

/**
 * @callback HttpRequestFormat
 * @param {LogEntry} logEntry Description
 */

/**
 * @typedef {Object} Options
 * @property {HttpRequestFormat} [httpRequestFormat]
 * @property {string} [useLevel=info]
 */

/**
 *
 * @param {*} param0
 */
function formatCurrentTrace({ traceId, spanId }) {
  return {
    'logging.googleapis.com/spanId': spanId,
    'logging.googleapis.com/trace': traceId,
    'logging.googleapis.com/trace_sampled': true,
  };
}

const formatters = {
  /**
   *
   * @param {LogEntry} param0
   */
  gcloud: function ({ request, response, latency }) {
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
    // https://cloud.google.com/logging/docs/agent/configuration#special-fields

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

const defaultOptions = {
  useLevel: 'info',
  ignoreUserAgents: ['GoogleHC/1.0'],
  httpRequestFormat: formatters.gcloud,
};

/**
 *
 * @param {*} options
 */
exports.httpMiddleware = function httpMiddleware(options) {
  const { useLevel, ignoreUserAgents } = Object.assign(options, defaultOptions);

  /**
   *
   * @param {import('http').IncomingMessage} request
   * @param {import('http').ServerResponse} response
   * @param {Error} [error]
   */
  function onResFinished(loggerInstance, request, response, error) {
    const latency = Date.now() - response[startTime];
    const isError = response.statusCode == 500 || !!error;

    loggerInstance[isError ? 'error' : useLevel](
      options.httpRequestFormat({
        response,
        request,
        latency: latency,
      }),
      error
    );
  }

  /**
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   * @param {function} next
   */
  function loggingMiddleware(req, res, next) {
    res[startTime] = res[startTime] || Date.now();

    const context = isLive && getGlobalContext();

    // if the tracer is ignoring certain urls then it wont be available
    const globalFields = context ? formatCurrentTrace(context) : {};

    const requestLogger = parentLogger.child({
      ...globalFields,
    });

    if (ignoreUserAgents.includes(req.headers['user-agent'])) {
      return next();
    }

    res.once('finish', () => onResFinished(requestLogger, req, res));
    res.once('error', (err) => onResFinished(requestLogger, req, res, err));

    return next();
  }
  return loggingMiddleware;
};

/**
 * @param0 {*} userContext
 * @returns {import('pino').Logger} Logger
 */
exports.createLogger = function createLogger(context = {}) {
  const globalContext = isLive && getGlobalContext();
  const globalContextFields = globalContext ? formatCurrentTrace(globalContext) : {};

  return parentLogger.child({
    ...globalContextFields,
    ...context,
  });
};

exports.logger = parentLogger;
