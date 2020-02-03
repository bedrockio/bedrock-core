const Koa = require('koa');
const koaMount = require('koa-mount');
const koaLogger = require('koa-logger');
const basicAuth = require('koa-basic-auth');
const envMiddleware = require('./src/utils/middleware/env');
const assetsMiddleware = require('./src/utils/middleware/assets');
const historyMiddleware = require('./src/utils/middleware/history');
const redirectHttpsMiddleware = require('./src/utils/middleware/redirectHttps');
const templateMiddleware = require('./src/utils/middleware/template');
const healthCheckMiddleware = require('./src/utils/middleware/healthCheck');
const { getAll } = require('./src/utils/env');

const {
  BIND_PORT,
  BIND_HOST,
  REDIRECT_TO_HTTPS,
  ENABLE_HTTP_BASIC_AUTH,
  HTTP_BASIC_AUTH_PATH,
  HTTP_BASIC_AUTH_USER,
  HTTP_BASIC_AUTH_PASS,
} = getAll();

const app = new Koa();

app.use(healthCheckMiddleware);

if (REDIRECT_TO_HTTPS) {
  app.use(redirectHttpsMiddleware);
}

if (ENABLE_HTTP_BASIC_AUTH) {
  app.use(koaMount(HTTP_BASIC_AUTH_PATH,
    basicAuth({
      user: HTTP_BASIC_AUTH_USER,
      pass: HTTP_BASIC_AUTH_PASS
    })
  ));
}

app.use(koaMount('/assets/', assetsMiddleware('./dist/assets')));
app.use(koaLogger());
app.use(envMiddleware());
app.use(historyMiddleware({ for: ['/', '/admin/'] }));
app.use(templateMiddleware({ apps: ['/', '/admin/'] }));

app.listen(BIND_PORT, BIND_HOST, (err) => {
  if (err) throw err;
  console.info(
    `🐬  Prod App server listening at http://${BIND_HOST}:${BIND_PORT} 🐬\r\n\r\n`
  );
});
