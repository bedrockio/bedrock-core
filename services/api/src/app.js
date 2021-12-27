const Router = require('@koa/router');
const Koa = require('koa');
const bodyParser = require('koa-body');
const errorHandler = require('./utils/middleware/error-handler');
const corsMiddleware = require('./utils/middleware/cors');
const applicationMiddleware = require('./utils/middleware/application');
const Sentry = require('@sentry/node');
const path = require('path');
const { version } = require('../package.json');
const routes = require('./routes');
const config = require('@bedrockio/config');
const { loadOpenApiDefinitions, expandOpenApi } = require('./utils/openapi');
const { loggingMiddleware } = require('@bedrockio/instrumentation');

const app = new Koa();

const ENV_NAME = config.get('ENV_NAME');

app
  .use(errorHandler)
  .use(loggingMiddleware())
  .use(corsMiddleware())
  .use(
    applicationMiddleware({
      ignorePaths: ['/', '/openapi.json', '/openapi.lite.json', '/1/status', '/1/status/mongodb', /\/1\/applications/],
    })
  )
  .use(bodyParser({ multipart: true }));

app.on('error', (err, ctx) => {
  if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
    // When streaming media, clients may arbitrarily close the
    // connection causing these errors when writing to the stream.
    return;
  }
  // dont output stacktraces of errors that is throw with status as they are known
  if (!err.status || err.status === 500) {
    ctx.logger.error(err);
    Sentry.withScope(function (scope) {
      scope.addEventProcessor(function (event) {
        return Sentry.Handlers.parseRequest(event, ctx.request);
      });
      Sentry.captureException(err);
    });
  }
});

if (config.has('SENTRY_DSN')) {
  Sentry.init({
    dsn: config.get('SENTRY_DSN'),
  });
}

const router = new Router();
app.router = router;
router.get('/', (ctx) => {
  ctx.body = {
    environment: ENV_NAME,
    version,
    openapiPath: '/openapi.json',
    servedAt: new Date(),
  };
});

const openApiLiteDefinition = loadOpenApiDefinitions(path.join(__dirname, '/routes/__openapi__'), '/1');
router.get('/openapi.lite.json', (ctx) => {
  ctx.body = openApiLiteDefinition;
});

const openApiDefinition = expandOpenApi(openApiLiteDefinition);
router.get('/openapi.json', (ctx) => {
  ctx.body = openApiDefinition;
});

router.use('/1', routes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
