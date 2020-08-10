import fs from 'fs';
import * as config from '@bedrockio/config'

function getParamsFromValidationMiddleware(validationMiddleware, type) {
  const { convert } = require('@yeongjet/joi-to-json-schema');

  try {
    const params = [];
    const { schemas } = validationMiddleware;
    const schema = schemas[type];
    if (!schema) return [];
    const jsonSchema = convert(schema);
    const { properties, required } = jsonSchema;
    Object.keys(properties).forEach((name) => {
      params.push({
        name,
        description: '',
        required: (required || []).includes(name),
        schema: properties[name],
      });
    });
    return params;
  } catch (error) {
    console.warn(`Warning could not convert Joi validation to JSON: ${error.message}`);
    return [];
  }
}

const routerToOpenApi = (router) => {
  const { stack } = router;
  const paths = stack
    .filter((layer) => layer.methods.length > 0)
    .map((layer) => {
      const { methods, path } = layer;
      let [method] = methods;
      if (methods.includes('HEAD')) {
        method = 'GET';
      }
      const definition: { [key: string]: any; } = {
        method,
        path,
      };
      const validationMiddleware = layer.stack.find((layer) => !!layer.schemas);
      if (validationMiddleware) {
        const query = getParamsFromValidationMiddleware(validationMiddleware, 'query');
        if (query && query.length) {
          definition.requestQuery = query;
        }
        const body = getParamsFromValidationMiddleware(validationMiddleware, 'body');
        if (body && body.length) {
          definition.requestBody = body;
        }
      }
      definition.responseBody = [];
      definition.examples = [];
      return definition;
    });
  return {
    paths,
  };
};

export { routerToOpenApi };

const loadOpenApiDefinitions = (dir, rootPath) => {
  return fs
    .readdirSync(dir)
    .filter((path) => path.match('.json'))
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
};

export { loadOpenApiDefinitions };

// This is just for OpenAPI/Swagger compatibility purposes
const expandOpenApi = (definitions) => {
  const allPaths = {};
  definitions.forEach((module) => {
    const { paths } = module;
    if (paths) {
      paths.forEach((call) => {
        const { method, path, requestBody, examples } = call;
        if (!allPaths[path]) {
          allPaths[path] = {};
        }
        const object: { [key: string]: any; } = {
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
};

export { expandOpenApi };
