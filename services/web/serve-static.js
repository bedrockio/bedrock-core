const Koa = require('koa');
const koaLogger = require('koa-logger');
const koaMount = require('koa-mount');
const koaBasicAuth = require('koa-basic-auth');
const envMiddleware = require('./src/utils/middleware/env');
const assetsMiddleware = require('./src/utils/middleware/assets');
const historyMiddleware = require('./src/utils/middleware/history');
const templateMiddleware = require('./src/utils/middleware/template');
const healthCheckMiddleware = require('./src/utils/middleware/healthCheck');
const redirectHttpsMiddleware = require('./src/utils/middleware/redirectHttps');

const {
  BIND_PORT,
  BIND_HOST,
  REDIRECT_TO_HTTPS,
  ENABLE_HTTP_BASIC_AUTH,
  HTTP_BASIC_AUTH_PATH,
  HTTP_BASIC_AUTH_USER,
  HTTP_BASIC_AUTH_PASS,
  publicEnv,
} = require('./env');

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

app.use(koaMount('/assets/', assetsMiddleware('./dist/assets')));
app.use(koaLogger());
app.use(envMiddleware(publicEnv));
app.use(historyMiddleware({ apps: ['/'] }));
app.use(templateMiddleware({ apps: ['/'] }));

app.listen(BIND_PORT, BIND_HOST, (err) => {
  if (err) throw err;
  console.info(`🐬  Prod App server listening at http://${BIND_HOST}:${BIND_PORT} 🐬\r\n\r\n`);
});
