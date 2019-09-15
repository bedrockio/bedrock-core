const fs = require('fs');
const url = require('url');
const Koa = require('koa');
const compress = require('koa-compress');
const koaStatic = require('koa-static');
const config = require('@kaareal/config');

const {
  BIND_PORT,
  BIND_HOST,
  REDIRECT_TO_HTTPS,
  ENABLE_HTTP_BASIC_AUTH,
  HTTP_BASIC_AUTH_PATH,
  HTTP_BASIC_AUTH_USER,
  HTTP_BASIC_AUTH_PASS,
  ...configs
} = config.getAll();

const app = new Koa();

const redirecthttpsMiddleware = (ctx, next) => {
  if (ctx.secure) return next();
  if (ctx.get('x-forwarded-proto') === 'https') {
    return next();
  }

  if (ctx.protocol === 'http' && ctx.headers.host) {
    return ctx.redirect(`https://${ctx.headers.host}${ctx.url}`);
  }
  return next();
};

const healthCheckResponder = (ctx, next) => {
  if (ctx.headers['user-agent'] === 'GoogleHC/1.0') {
    const split = ctx.headers['user-agent'].split('/');
    if (split[0] === 'GoogleHC') {
      ctx.body = 'OK';
      return;
    }
  }
  return next();
};

app.use(healthCheckResponder);

if (REDIRECT_TO_HTTPS) {
  app.use(redirecthttpsMiddleware);
}

if (ENABLE_HTTP_BASIC_AUTH) {
  app.use(
    koaMount(
      HTTP_BASIC_AUTH_PATH,
      basicAuth({
        user: HTTP_BASIC_AUTH_USER,
        pass: HTTP_BASIC_AUTH_PASS
      })
    )
  );
}

function historyApiFallback(options = {}) {
  return function historyApi(ctx, next) {
    if (ctx.method !== 'GET') return next();
    if (
      typeof ctx.headers.accept !== 'string' ||
      ctx.headers.accept.indexOf('text/html') === -1 ||
      ctx.headers.accept.indexOf('*/*') === -1
    ) {
      return next();
    }

    const parsedUrl = url.parse(ctx.url);
    if (parsedUrl.pathname.indexOf('.') !== -1) return next();
    ctx.url = options.index;
    return next();
  };
}

const indexTemplate = fs
  .readFileSync('./dist/index.html')
  .toString()
  .replace(
    '<!--env:conf-->',
    `<script>window.__env_conf = ${JSON.stringify(configs)}</script>`
  );

app.use(compress());
app.use(historyApiFallback({ index: '/' }));
app.use(koaStatic('./dist', { index: false }));
app.use((ctx) => {
  ctx.body = indexTemplate;
});

app.listen(BIND_PORT, BIND_HOST, (err) => {
  if (err) throw err;
  console.info(
    `🐬  Prod App server listening at http://${BIND_HOST}:${BIND_PORT} 🐬\r\n\r\n`
  );
});
