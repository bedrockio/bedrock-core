const { kebabCase } = require('lodash');
const { assertPath } = require('./util');
const { getPlural } = require('./lang');
const { writeLocalFile } = require('./source');

const OPENAPI_DIR = 'services/api/src/v1/__openapi__';

async function generateOpenApi(options) {
  const { camelLower, camelUpper, pluralLower } = options;
  const kebab = kebabCase(pluralLower);
  const paramPath = `/:${camelLower}Id`;

  const openApiDir = await assertPath(OPENAPI_DIR);

  const obj = {
    objects: [
      {
        name: camelUpper,
        attributes: [
          getIdField(options),
          ...getSchemaFields(options, 'attributes'),
          ...getTimestamps(),
        ],
      },
    ],
    paths: [
      {
        method: 'POST',
        path: '/',
        requestBody: [...getSchemaFields(options, 'create')],
        responseBody: [getObjectReference(options)],
        examples: [],
      },
      {
        method: 'GET',
        path: paramPath,
        responseBody: [getObjectReference(options)],
        examples: [],
      },
      {
        method: 'POST',
        path: '/search',
        requestBody: [
          ...getSchemaFields(options, 'search'),
          ...getSearchFields(options),
        ],
        responseBody: [getObjectReferenceArray(options)],
        examples: [],
      },
      {
        method: 'PATCH',
        path: paramPath,
        requestBody: [...getSchemaFields(options, 'update')],
        responseBody: [getObjectReference(options)],
        examples: [],
      },
      {
        method: 'DELETE',
        path: paramPath,
        responseBody: [],
        examples: [],
      },
    ],
  };

  const source = JSON.stringify(obj, null, 2);
  await writeLocalFile(source, openApiDir, `${kebab}.json`);
}

function getIdField(options) {
  return {
    name: 'id',
    description: `Unique ID of the ${options.camelUpper}`,
    schema: {
      type: 'string',
    },
  };
}

function getObjectReference(options) {
  return {
    name: 'data',
    description: `${options.camelUpper} object`,
    schema: {
      type: options.camelUpper,
    },
  };
}

function getObjectReferenceArray(options) {
  return {
    name: 'data',
    description: `List of ${options.camelUpper} objects`,
    schema: {
      type: 'array',
      items: {
        type: options.camelUpper,
      },
    },
  };
}

function getTimestamps() {
  return [
    {
      name: 'createdAt',
      description: 'Date and time of creation',
      schema: {
        type: 'string',
        format: 'date-time',
      },
    },
    {
      name: 'updatedAt',
      description: 'Date and time of last change',
      schema: {
        type: 'string',
        format: 'date-time',
      },
    },
  ];
}

function getSchemaFields(options, type) {
  const setRequired = type !== 'attributes';
  const typeRequired = type === 'create';
  return options.schema.map((field) => {
    const { name, required } = field;
    const schema = getOpenApiSchema(field);
    const description = getFieldDescription(field, options);
    return {
      name,
      description,
      schema,
      ...(setRequired && {
        required: required && typeRequired,
      }),
    };
  });
}

function getFieldDescription(field, options) {
  const { camelUpper } = options;
  const { name, type, schemaType, autopopulate } = field;
  const isArray = type.match(/Array$/);
  const isRef = schemaType === 'ObjectId';
  const tokens = kebabCase(name).split('-');
  if (isRef) {
    if (autopopulate) {
      // ex. User token object
      tokens.push('object');
    } else {
      // ex. User token id
      tokens.push('id');
    }
  }
  if (isArray) {
    let last = tokens[tokens.length - 1];
    tokens[tokens.length - 1] = getPlural(last);
  }
  return `${camelUpper} ${tokens.join(' ')}`;
}

function getOpenApiSchema(field) {
  const { type, schemaType } = field;
  if (type.match(/Array$/)) {
    return {
      type: 'array',
      items: getOpenApiSchema({
        schemaType,
        type: schemaType,
      }),
    };
  } else if (schemaType === 'Date') {
    return {
      type: 'string',
      format: 'date-time',
    };
  } else if (schemaType === 'Number') {
    return {
      type: 'number',
    };
  } else {
    return {
      type: 'string',
    };
  }
}

function getSearchFields() {
  return [
    {
      name: 'skip',
      description: 'Offset for paginating results',
      required: false,
      schema: {
        default: 0,
        type: 'number',
      },
    },
    {
      name: 'sort',
      description: 'Sort object',
      required: false,
      schema: {
        default: {
          field: 'createdAt',
          order: 'desc',
        },
        type: 'object',
        properties: {
          field: {
            type: 'string',
          },
          order: {
            type: 'string',
          },
        },
        additionalProperties: false,
        patterns: [],
        required: ['field', 'order'],
      },
    },
    {
      name: 'limit',
      description: 'Maximum number of results to retrieve',
      required: false,
      schema: {
        default: 50,
        type: 'number',
      },
    },
  ];
}

module.exports = {
  generateOpenApi,
};
