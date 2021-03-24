const pino = require('pino');
const bytes = require('bytes');
const config = require('@bedrockio/config');
const { floor } = require('lodash');
const { getTracer } = require('@bedrockio/instrumentation');
const dateFormat = require('dateformat');
const chalk = require('chalk');

const tracer = getTracer('api');

function getTracerContext() {
  const currentSpan = tracer.getCurrentSpan();
  if (!currentSpan) return null;
  return currentSpan.context();
}

function getPrettyPrintConfig() {
  if (config.get('ENV_NAME') === 'development') {
    // pino-pretty is extremely hard to customize so
    // reset basic keys to false and hack own formatter
    // For dev use only.
    return {
      colorize: false,
      ignore:
        'logging.googleapis.com/spanId,logging.googleapis.com/trace,logging.googleapis.com/trace_sampled,httpRequest,severity',
      levelKey: null,
      timestampKey: null,
      messageFormat: (log) => {
        const time = dateFormat(log.time, '[yyyy-mm-dd"T"HH:MM:ss]');
        function getLevel(level) {
          if (level <= 20) {
            return chalk.gray('DEBUG');
          } else if (level <= 30) {
            return chalk.gray('INFO ');
          } else if (level <= 40) {
            return chalk.yellow('WARN ');
          } else {
            return chalk.red('ERROR');
          }
        }
        const level = getLevel(log.level);
        return chalk.reset(`${chalk.dim(time)} ${level} ${log.message}`);
      },
    };
  }
}

const parentLogger = pino({
  messageKey: 'message',
  formatters: {
    level(_, level) {
      let severity = 'default';
      if (level === 20) {
        severity = 'debug';
      }
      if (level === 30) {
        severity = 'info';
      }
      if (level === 40) {
        severity = 'warning';
      }
      if (level === 50) {
        severity = 'error';
      }
      if (level >= 60) {
        severity = 'critical';
      }
      return { severity };
    },
  },
  base: null,
  level: config.get('LOG_LEVEL') || 'info',
  prettyPrint: getPrettyPrintConfig(),
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
    const { method, url } = request;
    const { statusCode: status } = response;
    const length = response.getHeader('content-length');
    const meta = `${latency}ms ${length ? bytes(+length) : '?'}`;
    const message = `${chalk.white(method)} ${chalk.gray(url)} ${chalk.green(status)} ${chalk.gray(meta)}`;
    return {
      message,
      httpRequest: {
        requestMethod: method,
        requestUrl: url,
        requestSize: request.headers['content-length'],
        status,
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

  async function loggingMiddlewareInner(ctx, next) {
    if (ignoreUserAgents.includes(ctx.request.get('user-agent'))) {
      return next();
    }
    if (process.env.ENV_NAME === 'test') {
      return next();
    }

    const { req, res } = ctx;

    const startTime = Date.now();
    const requestLogger = createLogger();

    ctx.logger = requestLogger;

    res.once('finish', () => onResFinished(requestLogger, httpRequestFormat, startTime, req, res));
    res.once('error', (err) => onResFinished(requestLogger, httpRequestFormat, startTime, req, res, err));
    return next();
  }

  return loggingMiddlewareInner;
};

exports.logger = parentLogger;
