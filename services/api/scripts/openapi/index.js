const app = require('../../src/app');
const request = require('request-promise-native');
const convert = require('./convert');
const fs = require('fs').promises;
const path = require('path');
const routes = [];

function getErrors(middlewares) {
  const lastMiddleware = middlewares[middlewares.length - 1];
  const result = lastMiddleware.toString().match(/ctx.throw(?:\()([0-9'",\w\s])+(?:\))/g);

  if (!result || !result.length) return [];

  return result.map((c) => {
    const split = c.split(',').map((a) =>
      a
        .trim()
        .replace('ctx.throw(', '')
        .replace(/\)$/, '')
        .replace(/^['"]/, '')
        .replace(/['"]$/, '')
    );

    return {
      status: split[0],
      description: split[1]
    };
  });
}

app.router.use((ctx, next) => {
  return next();
});

const translatePath = {};

app.router.stack.forEach((route) => {
  if (!route.methods.length) return;
  const middlewares = route.stack;
  routes.push({
    errors: getErrors(middlewares),
    method: route.methods.filter((method) => method !== 'HEAD')[0],
    path: route.path.replace(/\/$/, ''),
    paramNames: route.paramNames,
    regexp: route.regexp
  });

  route.stack = [
    ...middlewares.splice(0, middlewares.length - 1).filter((c) => {
      return c.name !== 'middleware';
    }),
    async function(ctx) {
      ctx.body = ctx.state;
    }
  ];

  if (route.paramNames && route.paramNames.length) {
    let pathWithParams = route.path;
    route.paramNames.forEach((param) => {
      pathWithParams = pathWithParams.replace(`:${param.name}`, 'id');
    });
    translatePath[route.path] = pathWithParams;
  }
});

async function readResponse(routes) {
  const filePath = path.join(__dirname, '../..', '.tests-responses');
  const response = (await fs.readFile(filePath))
    .toString()
    .split('\n')
    .filter(Boolean)
    .map((c) => {
      return JSON.parse(c.trim());
    });

  await fs.unlink(filePath);

  const result = {};
  response.forEach((c) => {
    const found = routes.find((route) => {
      return route.method === c.method && route.regexp.test(c.path);
    });
    const id = `${c.method} ${found.path}`;
    if (!result[id]) {
      result[id] = [];
    }
    result[id].push(c);
  });
  return result;
}

const listener = app.listen(40015, async () => {
  const responsesMap = await readResponse(routes);
  for (const route of routes) {
    const path = translatePath[route.path] || route.path;
    try {
      const result = await request({
        method: route.method,
        uri: `http://127.0.0.1:${40015}${path}`,
        json: true,
        timeout: 1000
      });
      Object.assign(route, result, { translatePath: path });
    } catch (e) {
      // ignore
      console.error('error', e.message);
    }
    const responses = responsesMap[`${route.method} ${route.path}`];
    if (responses) {
      Object.assign(route, { responses });
    }
  }

  listener.close();

  const openapi = convert(routes);
  const filePath = path.join(__dirname, '../..', 'openapi.json');

  const baseString = (await fs.readFile(filePath)).toString();
  const base = baseString.length ? JSON.parse(baseString) : {};

  if (base.info.title) openapi.info.description = base.info.title;
  if (base.info.description) openapi.info.description = base.info.description;

  if (base.paths && openapi.paths) {
    Object.keys(base.paths).forEach((url) => {
      const route = openapi.paths[url];
      const oldRoute = base.paths[url];
      if (!route || !oldRoute) return;
      ['get', 'post', 'patch', 'delete', 'put'].forEach((method) => {
        if (!oldRoute[method] || !route[method]) return;
        if (oldRoute[method].summary) {
          route[method].summary = oldRoute[method].summary;
        }
      });
    });
  }

  await fs.writeFile(filePath, JSON.stringify(openapi, null, 2));
  process.exit(0);
});
