const Router = require('@koa/router');
const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-body');
const errorHandler = require('./utils/middleware/error-handler');
const Sentry = require('@sentry/node');
const path = require('path');
const { version } = require('../package.json');
const routes = require('./routes');
const config = require('@bedrockio/config');
const { loadOpenApiDefinitions, expandOpenApi } = require('./utils/openapi');
const { loggingMiddleware } = require('./utils/logging');

const app = new Koa();

const NODE_ENV = process.env.NODE_ENV;

app
  .use(
    cors({
      exposeHeaders: ['content-length'],
      maxAge: 600,
    })
  )
  .use(loggingMiddleware())
  .use(errorHandler)
  .use(bodyParser({ multipart: true }));

app.on('error', (err, ctx) => {
  // dont output stacktraces of errors that is throw with status as they are known
  if (!err.status || err.status === 500) {
    ctx.logger.error(err);
    Sentry.captureException(err);
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
    environment: NODE_ENV,
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
