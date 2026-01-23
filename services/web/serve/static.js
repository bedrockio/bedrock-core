import config from '@bedrockio/config';
import logger from '@bedrockio/logger';
import Koa from 'koa';
import koaBasicAuth from 'koa-basic-auth';
import koaMount from 'koa-mount';

import assetsMiddleware from './middleware/assets.js';
import envMiddleware from './middleware/env.js';
import healthCheckMiddleware from './middleware/healthCheck.js';
import historyMiddleware from './middleware/history.js';
import templateMiddleware from './middleware/template.js';

const SERVER_PORT = config.get('SERVER_PORT');
const SERVER_HOST = config.get('SERVER_HOST');

const app = new Koa();

app.use(healthCheckMiddleware);

if (config.has('SERVER_AUTH_PATH')) {
  app.use(
    koaMount(
      config.get('SERVER_AUTH_PATH'),
      koaBasicAuth({
        user: config.get('SERVER_AUTH_USER'),
        pass: config.get('SERVER_AUTH_PASS'),
      }),
    ),
  );
}

app
  .use(koaMount('/assets/', assetsMiddleware('./dist/assets')))
  .use(logger.middleware())
  .use(envMiddleware())
  .use(historyMiddleware({ apps: ['/'] }))
  .use(templateMiddleware({ apps: ['/'] }));

app.listen(SERVER_PORT, SERVER_HOST, (err) => {
  if (err) {
    throw err;
  }

  logger.info(
    `🐬  Prod App server listening at http://${SERVER_HOST}:${SERVER_PORT} 🐬\r\n\r\n`,
  );
});
