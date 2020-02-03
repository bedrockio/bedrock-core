const Koa = require('koa');
const config = require('@kaareal/config');
const webpackConfig = require('./webpack.config');
const webpack = require('koa-webpack');
const envMiddleware = require('./src/utils/middleware/env');
const historyMiddleware = require('./src/utils/middleware/history');
const terminateMiddleware = require('./src/utils/middleware/terminate');

const app = new Koa();

const { BIND_PORT, BIND_HOST } = config.getAll();

(async () => {
  const webpackMiddleware = await webpack({
    hotClient: {
      host: BIND_HOST,
      port: 34000
    },
    config: {
      ...webpackConfig,
      mode: 'development'
    }
  });

  app.use(terminateMiddleware('/assets/', webpackMiddleware));
  app.use(envMiddleware());
  app.use(historyMiddleware({ for: ['/', '/admin/'] }));
  app.use(webpackMiddleware);
  app.listen(BIND_PORT, BIND_HOST);

  console.info(`Running App on http://${BIND_HOST}:${BIND_PORT}/`);
})();
