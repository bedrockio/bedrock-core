const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const config = require('@bedrockio/config');
const { get, set, without, camelCase, kebabCase, startCase } = require('lodash');

const pluralize = mongoose.pluralize();

const PACKAGE_FILE = path.resolve(__dirname, '../../package.json');
const DEFINITION_FILE = path.resolve(__dirname, '../../openapi.json');

let definition;

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

async function generateDefinition() {
  const { version, description } = require(PACKAGE_FILE);
  const data = {
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
  return await updateDefinition(data);
}

function generatePaths(routes) {
  const paths = {};

  for (let layer of routes.router.stack) {
    const item = {};
    const { path: koaPath, methods } = layer;
    const [method] = without(methods, 'HEAD');

    if (!method) {
      continue;
    }

    const validation = layer.stack.find((item) => {
      return item.schema;
    });

    const schema = validation?.schema;

    Object.assign(item, getPathMeta(koaPath, method));

    if (schema) {
      item.requestBody = {
        content: {
          'application/json': {
            schema: schema.toOpenApi(),
          },
        },
      };
    }

    const parameters = layer.paramNames.map((param) => {
      const { name, modifier } = param;
      const required = modifier !== '?';
      return {
        name,
        in: 'path',
        required,
      };
    });

    if (parameters.length) {
      item.parameters = parameters;
    }

    if (!paths[koaPath]) {
      paths[koaPath] = {};
    }

    paths[koaPath][method.toLowerCase()] = item;
  }

  return paths;
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

function walkFields(arg, fn, path = []) {
  if (arg && typeof arg === 'object') {
    for (let [key, value] of Object.entries(arg)) {
      const p = [...path, key];
      const ret = fn({
        key,
        value,
        path: p,
      });
      if (ret === false) {
        continue;
      }
      walkFields(value, fn, p);
    }
  }
}

async function recordRequest(ctx) {
  const { method, routerPath } = ctx;
  const { type: requestType, body: requestBody } = ctx.request;
  const { type: responseType, headers: responseHeaders, status } = ctx.response;
  const requestId = getRequestId(ctx);
  const schema = getResponseSchema(ctx);

  // Ensure the body is properly converted to raw data.
  const responseBody = JSON.parse(JSON.stringify(ctx.response.body || {}));

  const hasRequest = requestType && !isEmpty(requestBody);
  const hasResponse = responseType && !isEmpty(responseBody);

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
  await updateDefinition(data);
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

function getResponseSchema(ctx) {
  const modelName = ctx.response.body?.data?.constructor?.modelName;
  if (modelName) {
    return {
      $ref: `#/components/schemas/${modelName}`,
    };
  }
}

async function updateDefinition(data) {
  const definition = mergeDeep(await loadDefinition(), data);
  extractSchemas(definition);
  await saveDefinition(definition);
  return definition;
}

const RESERVED_FIELDS = ['summary', 'description'];

function mergeDeep(target, source) {
  walkFields(source, ({ key, path, value }) => {
    if (RESERVED_FIELDS.includes(key)) {
      return;
    } else if (!isObject(get(target, path))) {
      set(target, path, value);
      return false;
    }
  });
  return target;
}

function isObject(arg) {
  return arg && typeof arg === 'object' && !Array.isArray(arg);
}

function isEmpty(obj = {}) {
  return Object.keys(obj).length === 0;
}

function generateModelSchemas() {
  const schemas = {};
  for (let model of Object.values(mongoose.models)) {
    const { modelName } = model;
    schemas[modelName] = model.getBaseSchema().toOpenApi();
  }
  return schemas;
}

module.exports = {
  DEFINITION_FILE,
  loadDefinition,
  saveDefinition,
  generateDefinition,
  recordRequest,
};
