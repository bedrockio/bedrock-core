import Router from '@koa/router';
import Koa from 'koa';
import cors from '@koa/cors';
import logger from 'koa-logger';
import bodyParser from 'koa-body';
import errorHandler from './middlewares/error-handler';
import Sentry from '@sentry/node';
import path from 'path';
import { version } from '../package.json';
import v1 from './v1';
import * as config from '@bedrockio/config';
import { loadOpenApiDefinitions, expandOpenApi } from './lib/utils/openapi';

const app = new Koa();

const NODE_ENV = process.env.NODE_ENV;

app
  .use(errorHandler)
  .use(NODE_ENV === 'test' ? (_, next) => next() : logger())
  .use(
    cors({
      exposeHeaders: ['content-length'],
      maxAge: 600,
    })
  )
  .use(bodyParser({ multipart: true }));

app.on('error', (err, ctx) => {
  if (ctx.status === 500) {
    console.error(err);
    Sentry.captureException(err);
  }
});

if (config.has('SENTRY_DSN')) {
  Sentry.init({
    dsn: config.get('SENTRY_DSN'),
  });
}

const router = new Router();
//app.router = router;
router.get('/', (ctx) => {
  ctx.body = {
    version,
    openapiPath: '/openapi.json',
  };
});

const openApiLiteDefinition = loadOpenApiDefinitions(path.join(__dirname, '/v1/__openapi__'), '/1');
router.get('/openapi.lite.json', (ctx) => {
  ctx.body = openApiLiteDefinition;
});

const openApiDefinition = expandOpenApi(openApiLiteDefinition);
router.get('/openapi.json', (ctx) => {
  ctx.body = openApiDefinition;
});

router.use('/1', v1.routes());

app.use(router.routes());
app.use(router.allowedMethods());

export default app;
