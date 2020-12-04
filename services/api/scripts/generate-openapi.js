const fs = require('fs');
const process = require('process');
const { routerToOpenApi } = require('../src/utils/openapi');

function routeExists(paths, method, path) {
  return !!paths.find((d) => d.method === method && d.path === path);
}

async function ensureOpenApipaths(destinationDir, router, routerName) {
  const destinationPath = `${destinationDir}/${routerName}.json`;
  console.info(`Checking for new routes in router ${routerName}`);
  let numNewRoutes = 0;
  const paths = [];
  if (fs.existsSync(destinationPath)) {
    JSON.parse(fs.readFileSync(destinationPath).toString()).paths.forEach((definition) => paths.push(definition));
  }
  const routerDefinition = routerToOpenApi(router);
  routerDefinition.paths.forEach((newDefinition) => {
    const { method, path } = newDefinition;
    if (!routeExists(paths, method, path)) {
      console.info(` Created entry for ${method} ${path}`);
      paths.push(newDefinition);
      numNewRoutes += 1;
    }
  });
  if (numNewRoutes > 0) {
    console.info(` Wrote ${numNewRoutes} paths to ${destinationPath.replace(/.+\/src/, 'src')}`);
    routerDefinition.paths = paths;
    fs.writeFileSync(destinationPath, JSON.stringify(routerDefinition, null, 2));
  }
}

async function run() {
  const openApiDir = __dirname + '/../src/v1/__openapi__';
  const routesDir = __dirname + '/../src/v1';
  const routerFiles = fs
    .readdirSync(routesDir)
    .filter((p) => p.match('.js'))
    .filter((p) => p !== 'index.js');
  const routers = routerFiles.map((file) => {
    return {
      router: require(`${routesDir}/${file}`),
      name: file.replace('.js', ''),
    };
  });
  for (const router of routers) {
    await ensureOpenApipaths(openApiDir, router.router, router.name);
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Fatal error: ${error.message}, exiting.`);
    console.error(error.stack);
    process.exit(1);
  });
