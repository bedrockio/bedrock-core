const Koa = require('koa');
const webpack = require('webpack');
const e2k = require('express-to-koa');
const historyMiddleware = require('./middleware/history');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = new Koa();

const { BIND_PORT, BIND_HOST } = require('../env');

(async () => {

  // Manually loading webpack-dev-middleware and webpack-hot-middleware
  // until support for webpack v5 lands in koa-webpack:
  // https://github.com/shellscape/koa-webpack/issues/126
  const webpackConfig = require('../webpack.config.js');
  const compiler = webpack({
    ...webpackConfig,
  });
  const wrappedDevMiddleware = e2k(webpackDevMiddleware(compiler));
  const wrappedHotMiddleware = e2k(webpackHotMiddleware(compiler));

  app.use(historyMiddleware({ apps: ['/'] }));
  app.use(wrappedDevMiddleware);
  app.use(wrappedHotMiddleware);

  app.listen(BIND_PORT, BIND_HOST, () => {
    console.info(`Running App on http://${BIND_HOST}:${BIND_PORT}`);
  });
})();
