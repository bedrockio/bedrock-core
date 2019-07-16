const Koa = require('koa');
const webpackConfig = require('./webpack.config');
const webpack = require('koa-webpack'); // eslint-disable-line
const historyApiFallback = require('./history-middleware');
const config = require('@kaareal/config');
const net = require('net');

const app = new Koa();

const { BIND_PORT, BIND_HOST, ...configs } = config.getAll();

function isPortInUse(port) {
  return new Promise((resolve, reject) => {
    const test = net
      .createServer()
      .once('error', (err) => {
        if (err.code != 'EADDRINUSE') return reject(err);
        resolve();
      })
      .once('listening', () => {
        test.once('close', () => resolve()).close();
      })
      .listen(port);
  });
}

const failedPort = [];
async function findPort(min, max) {
  if (failedPort.length > 10) {
    console.error(
      'failed to locate port after 10 attemps failed ports',
      failedPort
    );
    return;
  }
  const randomPort = Math.round(Math.random() * (max - min) + min);
  try {
    await isPortInUse(randomPort);
  } catch (e) {
    failedPort.push(randomPort);
    return findPort(min, max);
  }
  return randomPort;
}

(async () => {
  const webpackmiddleware = await webpack({
    hotClient: {
      host: BIND_HOST,
      port: await findPort(34000, 35000)
    },
    devMiddleware: {
      watchOptions: {
        ignored: /node_modules/
      }
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
