const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const { set, without, camelCase, kebabCase, startCase, mergeWith, isEqual } = require('lodash');
const config = require('@bedrockio/config');

const pluralize = mongoose.pluralize();

const PACKAGE_FILE = path.resolve(__dirname, '../../package.json');
const DEFINITION_FILE = path.resolve(__dirname, '../../openapi.json');

let definition;

async function loadDefinition() {
  try {
    definition = require(DEFINITION_FILE);
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
  const definition = await loadDefinition();
  const { version, description } = require(PACKAGE_FILE);
  definition.openapi = '3.1.0';
  definition.info = {
    version,
    title: description,
    ...definition.info,
  };
  definition.servers = [
    {
      url: config.get('API_URL'),
    },
  ];

  const paths = generatePaths(require('../routes'));

  mergeWith(paths, definition.paths, (target, source) => {
    if (Array.isArray(target) && Array.isArray(source)) {
      if (!isEqual(target, source)) {
        // TODO: how should array merging be handled?
      }
    }
  });

  definition.paths = paths;

  extractComponents(definition);

  await saveDefinition(definition);
  return definition;
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
    const path = koaPath
      .split('/')
      .map((part) => {
        if (part.startsWith(':')) {
          part = part.slice(1);
          if (part.endsWith('?')) {
            part = part.slice(0, -1);
          }
          part = `{${part}}`;
        }
        return part;
      })
      .join('/');

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

    if (!paths[path]) {
      paths[path] = {};
    }

    paths[path][method.toLowerCase()] = item;
  }
  return paths;
}

function getPathMeta(koaPath, method) {
  const meta = {};

  let split = koaPath.split('/').slice(1);

  if (/^\d+/.test(split[0])) {
    split = split.slice(1);
  }

  const [base, operation] = split;

  if (split.length < 3) {
    let modelName;
    let modelNameCamel;
    let modelNamePlural;
    for (let name of Object.keys(mongoose.models)) {
      const kebab = kebabCase(name);
      const plural = pluralize(kebab);
      if (plural === base) {
        modelName = startCase(name).toLowerCase();
        modelNameCamel = camelCase(name);
        modelNamePlural = startCase(plural).toLowerCase();
      }
    }

    if (modelName) {
      const isId = operation === `:${modelNameCamel}Id`;
      if (method === 'GET' && isId) {
        meta.summary = `Get ${modelName} by id`;
      } else if (method === 'POST' && !operation) {
        meta.summary = `Create new ${modelName}`;
      } else if (method === 'PATCH' && isId) {
        meta.summary = `Update ${modelName}`;
      } else if (method === 'DELETE' && isId) {
        meta.summary = `Delete ${modelName}`;
      } else if (method === 'POST' && operation === 'search') {
        meta.summary = `Search ${modelNamePlural}`;
      }
    }
  }
  meta.tags = [startCase(base)];
  return meta;
}

function extractComponents(definition) {
  walkFields(definition, (path, value) => {
    const schema = value['x-schema'];
    if (schema) {
      const { ...clone } = value;
      delete clone['x-schema'];
      set(definition, ['components', 'schemas', schema], clone);
      return {
        $ref: `#/components/schemas/${schema}`,
      };
    }
  });
}

function walkFields(arg, fn, path = []) {
  if (arg && typeof arg === 'object') {
    for (let [key, value] of Object.entries(arg)) {
      const p = [...path, key];
      walkFields(value, fn, p);
      const ret = fn(p, value);
      if (ret !== undefined) {
        arg[key] = ret;
      }
    }
  }
}

module.exports = {
  DEFINITION_FILE,
  loadDefinition,
  saveDefinition,
  generateDefinition,
};
