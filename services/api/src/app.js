const Router = require('@koa/router');
const Koa = require('koa');
const { version } = require('../package.json');
const errorHandler = require('./utils/middleware/error-handler');
const corsMiddleware = require('./utils/middleware/cors');
const bodyMiddleware = require('./utils/middleware/body');
const recordMiddleware = require('./utils/middleware/record');
const serializeMiddleware = require('./utils/middleware/serialize');
const organizationMiddleware = require('./utils/middleware/organization');
const { applicationMiddleware } = require('./utils/middleware/application');
const { loadDefinition } = require('./utils/openapi');
const logger = require('@bedrockio/logger');
const Sentry = require('@sentry/node');
const routes = require('./routes');

const { ENV_NAME, SENTRY_DSN } = process.env;

const app = new Koa();

app.use(corsMiddleware());

// Application middleware must occur after serialization
// as it will record a snapshot of the response body.
if (['staging', 'development'].includes(ENV_NAME)) {
  // has to be the added before any middleware that changes the ctx.body
  app.use(
    applicationMiddleware({
      ignorePaths: [
        '/',
        '/openapi.json',
        '/1/status',
        '/1/status/mongodb',
        /\/1\/applications/,
        /\/1\/uploads\/[a-f0-9]{24}\/raw$/,
      ],
    })
  );
}

app.use(serializeMiddleware);
app.use(organizationMiddleware);

// Record middleware must occur before serialization to
// derive model names but after errorHandler to capture
// error responses.
if (['development'].includes(ENV_NAME)) {
  app.use(recordMiddleware);
}

app.use(errorHandler);

app.use(logger.middleware()).use(bodyMiddleware());

app.on('error', (err, ctx) => {
  if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
    // When streaming media, clients may arbitrarily close the
    // connection causing these errors when writing to the stream.
    return;
  }
  // dont output stacktraces of errors that is throw with status as they are known
  if (!err.status || err.status >= 500) {
    logger.error(err);
    Sentry.withScope(function (scope) {
      scope.addEventProcessor(function (event) {
        return Sentry.addRequestDataToEvent(event, ctx.request, {
          include: {
            user: false,
          },
        });
      });
      Sentry.captureException(err);
    });
  }
});

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV_NAME,
  });
}

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = {
    version,
    environment: ENV_NAME,
    openapiPath: '/openapi.json',
    servedAt: new Date(),
  };
});

router.get('/openapi.json', async (ctx) => {
  ctx.body = {
    data: await loadDefinition(),
  };
});

router.use(routes);

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
