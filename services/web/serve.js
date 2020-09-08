const Koa = require('koa');
const webpack = require('koa-webpack');
const webpackConfig = require('./webpack.config');
const envMiddleware = require('./src/utils/middleware/env');
const historyMiddleware = require('./src/utils/middleware/history');
const terminateMiddleware = require('./src/utils/middleware/terminate');

const app = new Koa();

const { BIND_PORT, BIND_HOST, publicEnv } = require('./env');

(async () => {
  const webpackMiddleware = await webpack({
    hotClient: {
      host: BIND_HOST,
      port: 34001,
    },
    devMiddleware: {
      watchOptions: {
        ignored: /node_modules/,
      },
    },
    config: {
      ...webpackConfig,
      mode: 'development',
    },
  });

  app.use(terminateMiddleware('/assets/', webpackMiddleware));
  app.use(envMiddleware(publicEnv));
  app.use(historyMiddleware({ apps: ['/'] }));
  app.use(webpackMiddleware);
  app.listen(BIND_PORT, BIND_HOST, () => {
    console.info(`Running App on http://${BIND_HOST}:${BIND_PORT}/`);
  });
})();
