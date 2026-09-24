import fs from 'fs/promises';
import path from 'path';
import http from 'http';
import mongoose from 'mongoose';
import config from '@bedrockio/config';
import Router from '@koa/router';

import { set, without, groupBy, camelCase, kebabCase, startCase, uniqBy } from 'lodash-es';
import packageJson from '../../package.json' with { type: 'json' };

const pluralize = mongoose.pluralize();

const DEFINITION_FILE = path.resolve(import.meta.dirname, '../../openapi.json');

const SHARED_SCHEMAS = {
  SearchMeta: {
    type: 'object',
    properties: {
      total: { type: 'number' },
      skip: { type: 'number' },
      limit: { type: 'number' },
    },
  },
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'number' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
};

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

// Generation

async function generateDefinition() {
  const { version, description } = packageJson;
  const { default: routes } = await import('../routes/index.js');
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
    paths: await generatePaths(routes),
    components: {
      schemas: {
        ...generateModelSchemas(),
        ...SHARED_SCHEMAS,
      },
      // Describes JWT tokens by Bearer
      // https://swagger.io/docs/specification/authentication/bearer-authentication/
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };

  extractSchemas(definition);
  await saveDefinition(definition);
  return definition;
}

// Route generation

async function generatePaths(routes) {
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
    const permissions = getLayerPermissions(layer) || currentContext.permissions;

    // If there is no method then this is a middleware layer
    // like authenticate or requirePermissions so do not process.
    if (!method) {
      // If this is an authentication or permissions layer
      // then apply it to the current context.
      if (authentication) {
        currentContext.authentication = authentication;
      }
      if (permissions) {
        currentContext.permissions = permissions;
      }

      continue;
    }

    const validationLayer = layer.stack.find((item) => {
      return item.validation;
    });

    const documentationLayer = layer.stack.find((item) => {
      return item.documentation;
    });

    const { crudAction, ...meta } = getPathMeta(koaPath, method);
    Object.assign(item, meta);

    const parameters = layer.paramNames.map((param) => {
      const { name, modifier } = param;
      const required = modifier !== '?';
      return {
        name,
        in: 'path',
        required,
        schema: {
          type: 'string',
        },
      };
    });

    if (validationLayer) {
      const { type, schema } = validationLayer.validation;

      const openApi = toOpenApi(schema);
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

    const parts = documentationLayer?.documentation || [];
    const descriptionPart = parts.find((part) => {
      return part.type === 'description';
    });
    if (descriptionPart) {
      item.summary = descriptionPart.summary;
      item.description = descriptionPart.description;
    }

    const formats = item.requestBody?.content['application/json']?.schema.properties?.format?.enum;
    const inferred = getInferredResponses(crudAction, meta['x-model'], formats?.includes('csv'));
    item.responses = await generateResponses(koaPath, method, parts, inferred);

    if (!paths[koaPath]) {
      paths[koaPath] = {};
    }

    // Authentication description. Note that in OpenAPI 3.0 bearerAuth MUST
    // be an empty array as scopes only apply to OAuth 2. An empty object means
    // that no authentication is required.
    // https://swagger.io/docs/specification/authentication/bearer-authentication/
    if (authentication === 'optional') {
      item['security'] = [{}, { bearerAuth: [] }];
    } else if (authentication === 'required') {
      item['security'] = [{ bearerAuth: [] }];
    } else {
      item['security'] = [];
    }

    // There is currently no way in OpenAPI 3.0 to describe role based permissions
    // except using proper OAuth 2, so using an extension here.
    if (permissions) {
      item['x-permissions'] = permissions;
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

function getLayerPermissions(layer) {
  const permissionsLayer = layer.stack.find((item) => {
    return item.permissions;
  });
  return permissionsLayer?.permissions;
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
      meta['x-model'] = modelName;
      meta.crudAction = 'get';
    } else if (method === 'POST' && !suffix) {
      meta.summary = `Create new ${modelNameLower}`;
      meta['x-model'] = modelName;
      meta.crudAction = 'create';
    } else if (method === 'PATCH' && isId) {
      meta.summary = `Update ${modelNameLower}`;
      meta['x-model'] = modelName;
      meta.crudAction = 'update';
    } else if (method === 'DELETE' && isId) {
      meta.summary = `Delete ${modelNameLower}`;
      meta['x-model'] = modelName;
      meta.crudAction = 'delete';
    } else if (method === 'POST' && suffix === 'search') {
      meta.summary = `Search ${modelNamePlural}`;
      meta['x-model'] = modelName;
      meta.crudAction = 'search';
    } else if (method === 'POST' && suffix === 'mine/search') {
      meta.summary = `Search ${modelNamePlural} for authenticated user.`;
      meta['x-model'] = modelName;
      meta.crudAction = 'search';
    }
  }
  return meta;
}

// Response generation

function getInferredResponses(crudAction, modelName, allowExport) {
  const ref = {
    $ref: `#/components/schemas/${modelName}`,
  };
  if (crudAction === 'delete') {
    return { 204: {} };
  } else if (crudAction === 'search') {
    return {
      200: {
        allowExport,
        schema: {
          type: 'object',
          properties: {
            data: { type: 'array', items: ref },
            meta: { $ref: '#/components/schemas/SearchMeta' },
          },
        },
      },
    };
  } else if (crudAction) {
    return {
      200: {
        schema: {
          type: 'object',
          properties: {
            data: ref,
          },
        },
      },
    };
  }
  return {};
}

async function generateResponses(koaPath, method, parts, inferred) {
  const declared = groupBy(
    parts.filter((part) => {
      return part.type !== 'description';
    }),
    'status',
  );

  const responses = {};
  const statuses = new Set([...Object.keys(inferred), ...Object.keys(declared)]);

  for (let status of statuses) {
    const variants = declared[status] || [{}];
    const inferredSchema = inferred[status]?.schema;

    const entries = variants
      .map((variant) => {
        let schema;
        if (variant.type === 'error') {
          schema = { $ref: '#/components/schemas/Error' };
        } else if (variant.schema) {
          schema = toOpenApi(variant.schema);
        } else {
          schema = inferredSchema;
        }
        return { schema, description: variant.description };
      })
      .filter((entry) => entry.schema);

    const unique = uniqBy(entries, (entry) => JSON.stringify(entry.schema));

    let schema;
    if (unique.length > 1) {
      schema = {
        oneOf: unique.map((entry) => {
          return { ...entry.schema, description: entry.description };
        }),
      };
    } else {
      schema = unique[0]?.schema;
    }

    const description = variants
      .map((variant) => variant.description)
      .filter(Boolean)
      .join('\n\n');

    const examples = await getExamples(`${method} ${koaPath} ${status}`, variants);

    responses[status] = {
      description: description || http.STATUS_CODES[status],
      ...((schema || examples) && {
        content: {
          'application/json': {
            ...(schema && { schema }),
            ...(examples && { examples }),
          },
          ...(inferred[status]?.allowExport && {
            'text/csv': {
              schema: { type: 'string' },
            },
          }),
        },
      }),
    };
  }

  return responses;
}

async function getExamples(label, variants) {
  const examples = {};
  for (let variant of variants) {
    const { name, description, example, schema } = variant;
    if (example === undefined) {
      continue;
    }
    const key = name || kebabCase(description) || 'default';
    if (examples[key]) {
      throw new Error(`${label}: duplicate example "${key}".`);
    }
    if (schema) {
      try {
        await schema.validate(example, { stripUnknown: true });
      } catch (error) {
        throw new Error(
          `${label}: example "${key}" does not match its schema: ${error.getFullMessage?.() || error.message}`,
          {
            cause: error,
          },
        );
      }
    }
    examples[key] = {
      summary: description,
      value: example,
    };
  }
  return Object.keys(examples).length ? examples : undefined;
}

function toOpenApi(schema) {
  const openApi = schema.toOpenApi({
    tag(meta) {
      if (meta.format === 'date-time') {
        return {
          'x-schema': 'DateTime',
          'x-description': 'A `string` in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.',
        };
      }
    },
  });
  return replaceModelRefs(openApi);
}

// Models in documented schemas are tagged "x-ref" by utils/documentation.
function replaceModelRefs(value) {
  if (Array.isArray(value)) {
    return value.map(replaceModelRefs);
  } else if (value && typeof value === 'object') {
    if (value['x-ref']) {
      return { $ref: `#/components/schemas/${value['x-ref']}` };
    }
    const result = {};
    for (let [key, val] of Object.entries(value)) {
      result[key] = replaceModelRefs(val);
    }
    return result;
  }
  return value;
}

// Component generation

function generateModelSchemas() {
  const schemas = {};
  for (let model of Object.values(mongoose.models)) {
    const { modelName } = model;

    if (modelName.startsWith('_')) {
      // Skip helper models like __counter for incrementing.
      continue;
    }

    const schema = model.getBaseSchema().toOpenApi();
    schemas[modelName] = {
      ...schema,
      properties: {
        id: {
          $ref: '#/components/schemas/ObjectId',
        },
        ...schema.properties,
      },
      required: ['id', ...(schema.required || [])],
    };
  }
  return schemas;
}

function extractSchemas(definition) {
  walkFields(definition, ({ value, path }) => {
    const schema = value?.['x-schema'];
    let halt = false;
    if (schema) {
      set(definition, ['components', 'schemas', schema], {
        ...value,
        title: value['x-title'],
        description: value['x-description'],
        default: undefined,
        'x-title': undefined,
        'x-description': undefined,
        'x-schema': undefined,
      });
      set(definition, path, {
        $ref: `#/components/schemas/${schema}`,
        title: value.title,
        default: value.default,
        description: value.description,
      });
      halt = true;
    }
    return !halt;
  });
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

export { DEFINITION_FILE, loadDefinition, generateDefinition, saveDefinition };
