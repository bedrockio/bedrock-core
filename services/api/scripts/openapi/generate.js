
const fs = require('fs')
const process = require('process');
const { routerToOpenApi } = require('../../src/lib/utils')

function routeExists(definitions, method, path) {
  return !!definitions.find(d => d.method === method && d.path === path)
}

async function ensureOpenApiDefinitions(destinationDir, router, routerName) {
  const destinationPath = `${destinationDir}/${routerName}.json`
  console.info(`Checking for new routes in router ${routerName}`)
  let numNewRoutes = 0;
  const definitions = []
  if (fs.existsSync(destinationPath)) {
    JSON.parse(fs.readFileSync(destinationPath).toString()).forEach(definition => definitions.push(definition))
  }
  routerToOpenApi(router).forEach(newDefinition => {
    const { method, path } = newDefinition
    if (!routeExists(definitions, method, path)) {
      console.info(` Created entry for ${method} ${path}`)
      definitions.push(newDefinition)
      numNewRoutes += 1
    }
  })
  if (numNewRoutes > 0) {
    console.info(` Wrote ${numNewRoutes} definitions to ${destinationPath.replace(/.+\/src/, 'src')}`)
  }
  fs.writeFileSync(destinationPath, JSON.stringify(definitions, null, 2))
}

async function run() {
  const openApiDir = __dirname + '/../../src/v1/__openapi__'
  const routesDir = __dirname + '/../../src/v1'
  const routerFiles = fs.readdirSync(routesDir).filter(p => p.match('.js'))
  const routers = routerFiles.map(file => {
    return {
      router: require(`${routesDir}/${file}`),
      name: file.replace('.js', '')
    }
  })
  for (const router of routers) {
    await ensureOpenApiDefinitions(openApiDir, router.router, router.name)
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Fatal error: ${error.message}, exiting.`);
    console.error(error.stack)
    process.exit(1);
  });
