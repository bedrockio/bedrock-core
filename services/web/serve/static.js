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
const { omitBy } = require('lodash');

const config = require('@bedrockio/config');

const allConfig = config.getAll();
const publicEnv = pick(
  Object.keys(config.getAll()).filter((key) => key.start('SERVER'))
);

const {
  SERVER_PORT,
  SERVER_HOST,
  SERVER_REDIRECT_TO_HTTPS,
  SERVER_ENABLE_HTTP_BASIC_AUTH,
  SERVER_HTTP_BASIC_AUTH_PATH,
  SERVER_HTTP_BASIC_AUTH_USER,
  SERVER_HTTP_BASIC_AUTH_PASS,
  PUBLIC,
} = require('./env');

const app = new Koa();

app.use(healthCheckMiddleware);

if (SERVER_REDIRECT_TO_HTTPS) {
  app.use(redirectHttpsMiddleware);
}

if (SERVER_ENABLE_HTTP_BASIC_AUTH) {
  app.use(
    koaMount(
      SERVER_HTTP_BASIC_AUTH_PATH,
      koaBasicAuth({
        user: SERVER_HTTP_BASIC_AUTH_USER,
        pass: SERVER_HTTP_BASIC_AUTH_PASS,
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

app.listen(SERVER_PORT, SERVER_HOST, (err) => {
  if (err) throw err;
  // eslint-disable-next-line
  console.info(
    `🐬  Prod App server listening at http://${SERVER_HOST}:${SERVER_PORT} 🐬\r\n\r\n`
  );
});
