const Koa = require('koa');
const webpackConfig = require('./webpack.config');
const webpack = require('koa-webpack'); // eslint-disable-line
const historyApiFallback = require('./history-middleware');
const config = require('@kaareal/config');

const app = new Koa();

const { BIND_PORT, BIND_HOST, ...configs } = config.getAll();

(async () => {
  const webpackmiddleware = await webpack({
    hotClient: {
      host: BIND_HOST,
      port: 34000
    },
    config: {
      ...webpackConfig,
      mode: 'development'
    }
  });

  app.use(historyApiFallback({ index: '/' }));
  app.use((ctx, next) => {
    return next().then(() => {
      if (ctx.request.method === 'GET' && ctx.request.url === '/' && ctx.body) {
        ctx.body = ctx.body
          .toString()
          .replace(
            '<!--env:conf-->',
            `<script>window.__env_conf = ${JSON.stringify(configs)};</script>`
          );
      }
    });
  });

  app.use(webpackmiddleware);
  app.listen(BIND_PORT, BIND_HOST);

  console.info(`Running App on http://${BIND_HOST}:${BIND_PORT}/`);
})();
