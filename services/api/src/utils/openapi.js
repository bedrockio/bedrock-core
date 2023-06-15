const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { Stream } = require('node:stream');
const mongoose = require('mongoose');
const config = require('@bedrockio/config');

const { get, set, merge, isEmpty, without, camelCase, kebabCase, startCase } = require('lodash');

const pluralize = mongoose.pluralize();

const PACKAGE_FILE = path.resolve(__dirname, '../../package.json');
const DEFINITION_FILE = path.resolve(__dirname, '../../openapi.json');

const GENERATED_FIELDS = ['title', 'summary', 'description'];

let definition;

applyRouterHack();

// Definition read/write

async function loadDefinition() {
  try {
    const content = await fs.readFile(DEFINITION_FILE, 'utf-8');
    definition = JSON.parse(content);
  } catch {
    definition = {};
  }
  return definition;
}

async function saveDefinition(updated) {
  await fs.writeFile(DEFINITION_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  definition = updated;
}

// Definition update

async function updateDefinitionPath(path, value) {
  const definition = await loadDefinition();
  if (value === null) {
    // Unset field using undefined here.
    value = undefined;
  }
  const field = path[path.length - 1];
  set(definition, path, value);
  if (GENERATED_FIELDS.includes(field)) {
    set(definition, [...path.slice(0, -1), 'x-generated'], undefined);
  }
  await saveDefinition(definition);
}

// Generation

async function generateDefinition() {
  const { version, description } = require(PACKAGE_FILE);
  const definition = {
    openapi: '3.1.0',
    info: {
      version,
      title: description,
    },
    servers: [
      {
        url: config.get('API_URL'),
      },
    ],
    paths: generatePaths(require('../routes')),
    components: {
      schemas: generateModelSchemas(),
    },
  };

  await copyEditableFields(definition);
  extractSchemas(definition);
  await saveDefinition(definition);
  return definition;
}

// Route generation

function generatePaths(routes) {
  const paths = {};

  let currentContext = {};

  for (let layer of routes.router.stack) {
    const item = {};
    const { path: koaPath, methods } = layer;
    const [method] = without(methods, 'HEAD');

    // If this layer has a new prefix then reset the
    // context. See "applyRouterHack" below.
    if (layer.opts.prefix !== currentContext.prefix) {
      currentContext = {
        prefix: layer.opts.prefix,
      };
    }

    const authentication = getLayerAuthentication(layer) || currentContext.authentication;

    // If there is no method then this is a middleware layer
    // like authenticate or requirePermissions so do not process.
    if (!method) {
      // If this is an authentication layer then apply
      // it to the current context.
      if (authentication) {
        currentContext.authentication = authentication;
      }

      continue;
    }

    const validationLayer = layer.stack.find((item) => {
      return item.validation;
    });

    Object.assign(item, getPathMeta(koaPath, method));

    const parameters = layer.paramNames.map((param) => {
      const { name, modifier } = param;
      const required = modifier !== '?';
      return {
        name,
        in: 'path',
        required,
      };
    });

    if (validationLayer) {
      const { type, schema } = validationLayer.validation;

      const openApi = schema.toOpenApi({
        tag: (meta) => {
          if (meta.format === 'date-time') {
            return {
              'x-schema': 'DateTime',
              'x-description':
                'A `string` in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.',
            };
          }
        },
      });
      if (type === 'body') {
        item.requestBody = {
          content: {
            'application/json': {
              schema: openApi,
            },
          },
        };
      } else if (type === 'query') {
        for (let [key, value] of Object.entries(openApi.properties || {})) {
          parameters.push({
            in: 'query',
            name: key,
            schema: value,
          });
        }
      } else if (type === 'files') {
        item.requestBody = {
          content: {
            'multipart/form-data': {
              schema: openApi,
            },
          },
        };
      }
    }

    if (parameters.length) {
      item.parameters = parameters;
    }

    if (!paths[koaPath]) {
      paths[koaPath] = {};
    }

    if (authentication === 'optional') {
      item['security'] = [{}, { bearerAuth: [] }];
    } else if (authentication === 'required') {
      item['security'] = [{ bearerAuth: [] }];
    }

    paths[koaPath][method.toLowerCase()] = item;
  }

  return paths;
}

function getLayerAuthentication(layer) {
  const authLayer = layer.stack.find((item) => {
    return item.authentication;
  });
  return authLayer?.authentication;
}

function getPathMeta(koaPath, method) {
  const meta = {};

  let split = koaPath.split('/').slice(1);

  if (/^\d+/.test(split[0])) {
    split = split.slice(1);
  }

  const [base, ...rest] = split;

  const suffix = rest.join('/');

  let modelName;
  let modelNameLower;
  let modelNameCamel;
  let modelNamePlural;
  for (let name of Object.keys(mongoose.models)) {
    const kebab = kebabCase(name);
    const plural = pluralize(kebab);
    if (plural === base) {
      modelName = name;
      modelNameLower = startCase(name).toLowerCase();
      modelNameCamel = camelCase(name);
      modelNamePlural = startCase(plural).toLowerCase();
    }
  }

  if (modelName) {
    const isId = suffix === ':id' || suffix === `:${modelNameCamel}Id`;
    if (method === 'GET' && isId) {
      meta.summary = `Get ${modelNameLower} by id`;
    } else if (method === 'POST' && !suffix) {
      meta.summary = `Create new ${modelNameLower}`;
    } else if (method === 'PATCH' && isId) {
      meta.summary = `Update ${modelNameLower}`;
    } else if (method === 'DELETE' && isId) {
      meta.summary = `Delete ${modelNameLower}`;
    } else if (method === 'POST' && suffix === 'search') {
      meta.summary = `Search ${modelNamePlural}`;
    } else if (method === 'POST' && suffix === 'mine/search') {
      meta.summary = `Search ${modelNamePlural} for authenticated user.`;
    }
  }
  meta['x-model'] = modelName;
  return meta;
}

// Component generation

function generateModelSchemas() {
  const schemas = {};
  for (let model of Object.values(mongoose.models)) {
    const { modelName } = model;
    schemas[modelName] = model.getBaseSchema().toOpenApi();
  }
  return schemas;
}

function extractSchemas(definition) {
  walkFields(definition, ({ value, path }) => {
    const schema = value?.['x-schema'];
    const ref = schema || value?.['x-ref'];
    let halt = false;
    if (schema) {
      set(definition, ['components', 'schemas', schema], {
        ...value,
        description: value['x-description'],
        'x-schema': undefined,
        'x-description': undefined,
      });
      halt = true;
    }
    if (ref) {
      set(definition, path, {
        $ref: `#/components/schemas/${ref}`,
        description: value?.description,
      });
      halt = true;
    }
    return !halt;
  });
}

// Recording

async function recordRequest(ctx) {
  const { method, routerPath } = ctx;
  const { type: requestType, body: requestBody } = ctx.request;
  const { type: responseType, headers: responseHeaders, status } = ctx.response;
  const requestId = getRequestId(ctx);
  const schema = getResponseSchema(ctx);

  let { body: responseBody } = ctx.response;

  if (responseBody instanceof Stream) {
    responseBody = '[Binary Data]';
  } else {
    // Ensure the body is properly converted to raw data.
    responseBody = JSON.parse(JSON.stringify(ctx.response.body || {}));
  }

  const hasRequest = requestType && !isEmpty(requestBody);
  const hasResponse = status < 500;

  const data = {
    paths: {
      [routerPath]: {
        [method.toLowerCase()]: {
          requestBody: {
            ...(hasRequest && {
              content: {
                [requestType]: {
                  examples: {
                    [requestId]: {
                      value: requestBody,
                    },
                  },
                },
              },
            }),
          },
          responses: {
            [status]: {
              headers: {
                ...responseHeaders,
                'access-control-allow-origin': '<Origin>',
                'request-id': '<RequestId>',
              },
              ...(hasResponse && {
                content: {
                  [responseType]: {
                    ...(schema && {
                      schema,
                    }),
                    examples: {
                      [requestId]: {
                        value: responseBody,
                        'x-path': ctx.path,
                      },
                    },
                  },
                },
              }),
            },
          },
        },
      },
    },
  };

  const definition = merge(await loadDefinition(), data);
  await saveDefinition(definition);
  return definition;
}

function getRequestId(ctx) {
  // Note that although in real-life applications responses may
  // vary as a function of time, for the purposes of documentation
  // we are assuming that they do not so any request with the same
  // signature will always generate the same request id.
  const obj = {
    method: ctx.method,
    path: ctx.path,
    body: ctx.request.body,
  };
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
}

// Utils

function walkFields(arg, fn, path = []) {
  if (arg && typeof arg === 'object') {
    for (let [key, value] of Object.entries(arg)) {
      const p = [...path, key];
      walkFields(value, fn, p);
      fn({
        key,
        value,
        path: p,
      });
    }
  }
}

function getResponseSchema(ctx) {
  const modelName = ctx.response.body?.data?.constructor?.modelName;
  if (modelName) {
    return {
      $ref: `#/components/schemas/${modelName}`,
    };
  }
}

// Editable fields

const JSON_SCHEMA_PRIMITIVE_TYPES = ['string', 'number', 'boolean'];

async function copyEditableFields(target) {
  const source = await loadDefinition();
  walkFields(target, (field) => {
    const { path } = field;
    if (isJsonSchemaPrimitive(field)) {
      const hasSource = GENERATED_FIELDS.some((field) => {
        return get(source, [...path, field]);
      });
      const hasTarget = GENERATED_FIELDS.some((field) => {
        return get(target, [...path, field]);
      });
      const xGenerated = get(source, [...path, 'x-generated']);

      if (hasSource && !xGenerated) {
        copyField(target, source, path, 'summary');
        copyField(target, source, path, 'description');
      } else if (hasTarget) {
        set(target, [...path, 'x-generated'], true);
      }
    } else if (isBodyField(field)) {
      copyField(target, source, path, 'examples');
    } else if (isOperationField(field)) {
      copyField(target, source, path, 'responses');
    }
  });
  return target;
}

function isJsonSchemaPrimitive(field) {
  return JSON_SCHEMA_PRIMITIVE_TYPES.includes(field.value?.type);
}

function isBodyField(field) {
  return matchPath(field.path, 'paths|*|*|requestBody|content|*');
}

function isOperationField(field) {
  return matchPath(field.path, 'paths|*|*');
}

function matchPath(path, str) {
  const split = str.split('|');
  if (split.length !== path.length) {
    return false;
  }
  return split.every((token, i) => {
    return token === '*' || path[i] === token;
  });
}

function copyField(target, source, path, field) {
  const fPath = [...path, field];
  const sValue = get(source, fPath);
  if (sValue) {
    set(target, fPath, sValue);
  }
}

// Hacks

// Router layers get flattened and do not have a way to
// disambigute different contexts (ie. middlewares that
// apply only to a given router). This hack stores the
// prefix to allow resetting the context later in order
// to determine if authentication applies to a given
// layer in the stack or not. This hack will only be
// applied when generating docs using this script and
// don't affect actual router functionality.
function applyRouterHack() {
  const Router = require('@koa/router');
  const routerUse = Router.prototype.use;

  Router.prototype.use = function (arg1, arg2) {
    if (typeof arg1 === 'string' && arg2?.router) {
      for (let layer of arg2.router.stack) {
        layer.opts.prefix += arg1;
      }
    }
    return routerUse.apply(this, arguments);
  };
}

module.exports = {
  DEFINITION_FILE,
  loadDefinition,
  generateDefinition,
  updateDefinitionPath,
  recordRequest,
};
