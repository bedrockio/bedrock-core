const Koa = require('koa');
const webpack = require('webpack');
const e2k = require('express-to-koa');
const envMiddleware = require('./middleware/env');
const historyMiddleware = require('./middleware/history');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = new Koa();

const { BIND_PORT, BIND_HOST, PUBLIC } = require('../env');

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
  const wrappedHotMiddleware = e2k(webpackHotMiddleware(compiler));

  app.use(envMiddleware(PUBLIC));
  app.use(historyMiddleware({ apps: ['/'] }));
  app.use(wrappedDevMiddleware);
  app.use(wrappedHotMiddleware);

  app.listen(BIND_PORT, BIND_HOST, () => {
    // eslint-disable-next-line
    console.info(`Running App on http://${BIND_HOST}:${BIND_PORT}`);
  });
})();
