const Router = require('koa-router');
const Koa = require('koa');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const bodyParser = require('koa-body');
const errorHandler = require('./middlewares/error-handler');
const Sentry = require('@sentry/node');
const fs = require('fs');
const { version } = require('../package.json');
const v1 = require('./v1');
const config = require('@kaareal/config');
const { loadOpenApiDefinitions } = require('./lib/utils')

const app = new Koa();

const NODE_ENV = process.env.NODE_ENV;

app
  .use(errorHandler)
  .use(NODE_ENV === 'test' ? (_, next) => next() : logger())
  .use(
    cors({
      exposeHeaders: ['content-length'],
      maxAge: 600
    })
  )
  .use(bodyParser({ multipart: true }));

app.on('error', (err) => {
  // dont output stacktraces of errors that is throw with status as they are known
  if (!err.status || err.status === 500) {
    console.error(err.stack);
  }
});

if (config.has('SENTRY_DSN')) {
  Sentry.init({
    dsn: config.get('SENTRY_DSN')
  });
}

const router = new Router();
app.router = router;
router.get('/', (ctx) => {
  ctx.body = {
    version,
    openapiPath: '/openapi.json'
  };
});

const openApiDefinition = loadOpenApiDefinitions(__dirname + '/v1/__openapi__', '/1')
router.get('/openapi.json', (ctx) => {
  ctx.body = openApiDefinition;
});

router.use('/1', v1.routes());

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
