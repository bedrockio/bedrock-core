const Koa = require('koa');
const webpack = require('webpack');
const e2k = require('express-to-koa');
const config = require('@bedrockio/config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const envMiddleware = require('./middleware/env');
const historyMiddleware = require('./middleware/history');

const SERVER_PORT = config.get('SERVER_PORT');
const SERVER_HOST = config.get('SERVER_HOST');

const app = new Koa();

(async () => {
  // Manually loading webpack-dev-middleware and webpack-hot-middleware
  // until support for webpack v5 lands in koa-webpack:
  // https://github.com/shellscape/koa-webpack/issues/126
  const webpackConfig = require('../webpack.config.js');
  const compiler = webpack({
    ...webpackConfig,
  });
  const devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: compiler.options.output.publicPath,
  });
  const wrappedDevMiddleware = (ctx, next) => {
    // Unfortunately koa-webpack is doing a bit more than adding in
    // koa wrappers, it also needs to pass in a fake response object as
    // webpack-dev-middleware breaks the middleware chain, so need to
    // replicate that behavior here:
    // https://github.com/shellscape/koa-webpack/blob/master/lib/middleware.js
    const ready = new Promise((resolve, reject) => {
      for (const comp of [].concat(compiler.compilers || compiler)) {
        comp.hooks.failed.tap('KoaWebpack', (error) => {
          reject(error);
        });
      }

      devMiddleware.waitUntilValid(() => {
        resolve(true);
      });
    });
    const init = new Promise((resolve) => {
      devMiddleware(
        ctx.req,
        {
          end: (content) => {
            ctx.body = content;
            resolve();
          },
          getHeader: ctx.get.bind(ctx),
          setHeader: ctx.set.bind(ctx),
          locals: ctx.state,
        },
        () => resolve(next())
      );
    });

    return Promise.all([ready, init]);
  };

  // Hot reloader also shows some issues with webpack v5
  // https://github.com/webpack-contrib/webpack-hot-middleware/pull/394
  const wrappedHotMiddleware = e2k(webpackHotMiddleware(compiler));

  app.use(envMiddleware());
  app.use(historyMiddleware({ apps: ['/'] }));
  app.use(wrappedDevMiddleware);
  app.use(wrappedHotMiddleware);

  app.listen(SERVER_PORT, SERVER_HOST, () => {
    // eslint-disable-next-line
    console.info(`Running App on http://${SERVER_HOST}:${SERVER_PORT}`);
  });
})();
