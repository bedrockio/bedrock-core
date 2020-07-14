const fs = require("fs");
const url = require("url");
const Koa = require("koa");
const compress = require("koa-compress");
const koaStatic = require("koa-static");
const config = require("@bedrockio/config");

const BIND_PORT = config.get("BIND_PORT", "integer");
const BIND_HOST = config.get("BIND_HOST");
const OPENAPI_URL = config.get("OPENAPI_URL");

const app = new Koa();

function historyApiFallback(options = {}) {
  return function historyApi(ctx, next) {
    if (ctx.method !== "GET") return next();
    if (
      typeof ctx.headers.accept !== "string" ||
      ctx.headers.accept.indexOf("text/html") === -1 ||
      ctx.headers.accept.indexOf("*/*") === -1
    ) {
      return next();
    }

    const parsedUrl = url.parse(ctx.url);
    if (parsedUrl.pathname.indexOf(".") !== -1) return next();
    ctx.url = options.index;
    return next();
  };
}

const indexTemplate = fs
  .readFileSync("./src/index.html")
  .toString()
  .replace("<!--redoc:element-->", `<redoc spec-url="${OPENAPI_URL}"></redoc>`);

app.use(compress());
app.use(historyApiFallback({ index: "/" }));
app.use(koaStatic("./src", { index: false }));
app.use((ctx) => {
  ctx.body = indexTemplate;
});

app.listen(BIND_PORT, BIND_HOST, (err) => {
  if (err) throw err;
  console.info(
    `🐬  Prod App server listening at http://${BIND_HOST}:${BIND_PORT} 🐬\r\n\r\n`
  );
});
