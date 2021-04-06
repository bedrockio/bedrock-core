const fs = require('fs');
const config = require('@bedrockio/config');

function loadOpenApiDefinitions(dir, rootPath) {
  return fs
    .readdirSync(dir)
    .filter((path) => path.match(/\.json$/))
    .map((path) => {
      const routerName = path.replace('.json', '');
      const routerDefinition = JSON.parse(fs.readFileSync(`${dir}/${path}`).toString());
      return {
        name: routerName,
        paths: routerDefinition.paths.map((definition) => {
          let definitionPath = definition.path;
          if (definitionPath.slice(-1) === '/') {
            definitionPath = definitionPath.slice(0, -1);
          }
          definition.path = `${rootPath}/${routerName}${definitionPath}`;
          return definition;
        }),
        objects: routerDefinition.objects,
      };
    });
}

// This is just for OpenAPI/Swagger compatibility purposes
function expandOpenApi(definitions) {
  const allPaths = {};
  definitions.forEach((module) => {
    const { paths } = module;
    if (paths) {
      paths.forEach((call) => {
        const { method, path, requestBody, examples } = call;
        if (!allPaths[path]) {
          allPaths[path] = {};
        }
        const object = {
          summary: `${method} ${path}`,
          operationId: `${method} ${path}`,
          tags: [module.name],
        };
        if (requestBody) {
          const properties = {};
          requestBody.forEach((param) => {
            properties[param.name] = {
              type: param.schema ? param.schema.type : 'object',
              description: param.description,
            };
          });
          object.requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties,
                },
                required: requestBody.filter((p) => p.required).map((p) => p.name),
              },
            },
          };
        }
        if (examples && examples[0] && examples[0].responseBody) {
          object.responses = {
            200: {
              'application/json': {
                default: {
                  value: examples[0].responseBody,
                },
              },
            },
          };
        }
        allPaths[path][method.toLowerCase()] = object;
      });
    }
  });
  return {
    openapi: '3.0.3',
    info: {
      title: `${config.get('APP_NAME')} API`,
      version: '1',
      contact: {
        url: config.get('APP_URL'),
        email: config.get('APP_SUPPORT_EMAIL'),
      },
    },
    paths: allPaths,
  };
}

module.exports = {
  loadOpenApiDefinitions,
  expandOpenApi,
};
