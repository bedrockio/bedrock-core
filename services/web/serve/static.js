const Koa = require('koa');

const { loggingMiddleware } = require('@bedrockio/instrumentation');
const koaMount = require('koa-mount');
const koaBasicAuth = require('koa-basic-auth');

const envMiddleware = require('./middleware/env');
const assetsMiddleware = require('./middleware/assets');
const historyMiddleware = require('./middleware/history');
const templateMiddleware = require('./middleware/template');
const healthCheckMiddleware = require('./middleware/healthCheck');
const redirectHttpsMiddleware = require('./middleware/redirectHttps');

const {
  BIND_PORT,
  BIND_HOST,
  REDIRECT_TO_HTTPS,
  ENABLE_HTTP_BASIC_AUTH,
  HTTP_BASIC_AUTH_PATH,
  HTTP_BASIC_AUTH_USER,
  HTTP_BASIC_AUTH_PASS,
  PUBLIC,
} = require('../env');

const app = new Koa();

app.use(healthCheckMiddleware);

if (REDIRECT_TO_HTTPS) {
  app.use(redirectHttpsMiddleware);
}

if (ENABLE_HTTP_BASIC_AUTH) {
  app.use(
    koaMount(
      HTTP_BASIC_AUTH_PATH,
      koaBasicAuth({
        user: HTTP_BASIC_AUTH_USER,
        pass: HTTP_BASIC_AUTH_PASS,
      })
    )
  );
}

app
  .use(koaMount('/assets/', assetsMiddleware('./dist/assets')))
  .use(loggingMiddleware())
  .use(envMiddleware(PUBLIC))
  .use(historyMiddleware({ apps: ['/'] }))
  .use(templateMiddleware({ apps: ['/'] }));

app.listen(BIND_PORT, BIND_HOST, (err) => {
  if (err) throw err;
  // eslint-disable-next-line
  console.info(
    `🐬  Prod App server listening at http://${BIND_HOST}:${BIND_PORT} 🐬\r\n\r\n`
  );
});
