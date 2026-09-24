import Router from '@koa/router';
import Koa from 'koa';
import packageJson from '../package.json' with { type: 'json' };
import errorHandler from './utils/middleware/error-handler.js';
import corsMiddleware from './utils/middleware/cors.js';
import bodyMiddleware from './utils/middleware/body.js';
import serializeMiddleware from './utils/middleware/serialize.js';
import organizationMiddleware from './utils/middleware/organization.js';
import { loadDefinition } from './utils/openapi.js';
import Sentry from '@sentry/node';
import routes from './routes/index.js';
import config from '@bedrockio/config';
import logger from '@bedrockio/logger';

const ENV_NAME = config.get('ENV_NAME');

const app = new Koa();

app.use(corsMiddleware());

app.use(serializeMiddleware);
app.use(organizationMiddleware);

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

if (config.has('SENTRY_DSN')) {
  Sentry.init({
    dsn: config.get('SENTRY_DSN'),
    environment: ENV_NAME,
  });
}

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = {
    version: packageJson.version,
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

export default app;
