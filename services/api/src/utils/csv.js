const { PassThrough } = require('stream');

const csv = require('fast-csv');
const yd = require('@bedrockio/yada');
const config = require('@bedrockio/config');
const mongoose = require('mongoose');
const { get, startCase } = require('lodash');

const { serializeObject } = require('./serialize');

const formatter = Intl.NumberFormat('us');

const API_URL = config.get('API_URL');

const DEFAULT_OPTIONS = {
  readableHeaders: true,
};

function csvExport(ctx, data, options) {
  const { filename } = options;

  const csvStream = csv.format({
    headers: true,
    objectMode: true,
  });

  options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  options.fields ||= getDefaultFields(data);

  ctx.body = csvStream.pipe(PassThrough());

  data.forEach((doc) => {
    const item = serializeObject(doc, ctx);
    const row = exportRow(item, {
      doc,
      ...options,
    });

    csvStream.write(row);
  });

  ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
  ctx.set('Content-Type', 'text/csv');

  csvStream.end();
}

function exportValidation(options = {}) {
  const { filename = 'export.csv' } = options;
  return {
    filename: yd.string().default(filename).description('Applies only when `format` is `"csv"`.'),
    format: yd.string().allow('json', 'csv').default('json'),
  };
}

function exportRow(item, options) {
  const { fields = [] } = options;

  let result = {};

  const expanded = expandFields(item, fields);

  for (let field of expanded) {
    exportValue(item, {
      ...options,
      ...field,
      result,
    });
  }

  result = convertCase(result, options);

  return result;
}

function exportValue(item, options) {
  const { base, field, result = {}, mapFields = {} } = options;
  const value = get(item, field);
  const mapper = mapFields[base];

  if (mapper) {
    if (typeof mapper === 'string') {
      result[mapper] = formatValue(value, options);
    } else {
      result[base] ||= mapper(item);
    }
  } else {
    result[field] = formatValue(value, options);
  }
}

// When expanding fields use a 2-step process here to ensure
// that array item positions are maintained. For example when
// expanding requested fields: ['user.name', 'user.age'],
// the resulting columns must be:
// user.0.name,user.0.age,user.1.name,user.1.age
// and not:
// user.0.name,user.1.name,user.0.age,user.1.age
function expandFields(item, fields) {
  const expanded = fields.flatMap((field) => {
    const [base, ...rest] = field.split('.');
    const value = get(item, base);
    if (Array.isArray(value)) {
      return value.flatMap((el, i) => {
        const innerFields = expandFields(el, [rest.join('.')]);
        return innerFields.map((obj) => {
          const path = obj.field ? [base, i, obj.field] : [base, i];
          return {
            type: 'expanded',
            index: i,
            base: field,
            field: path.join('.'),
          };
        });
      });
    } else if (isObject(value) && rest.length > 0) {
      return expandFields(value, [rest.join('.')]).map((obj) => {
        return {
          ...obj,
          field: [base, obj.field].join('.'),
        };
      });
    } else {
      return [
        {
          type: 'real',
          base: field,
          field,
        },
      ];
    }
  });

  expanded.sort((a, b) => {
    const { type: aType, index: aIndex } = a;
    const { type: bType, index: bIndex } = b;
    if (aType === 'expanded' && bType === 'expanded') {
      return aIndex - bIndex;
    } else {
      return;
    }
  });

  return expanded;
}

// Default fields

const DISALLOWED_FIELDS = ['createdAt', 'updatedAt', 'deletedAt', 'deleted'];

function getDefaultFields(data) {
  const [item] = data;
  if (isDocument(item)) {
    return getDefaultDocumentFields(item);
  } else {
    return getDefaultObjectFields(item);
  }
}

function isDocument(obj) {
  return obj instanceof mongoose.Document;
}

function getDefaultDocumentFields(doc) {
  return Object.keys(doc.schema.paths)
    .filter((field) => {
      return isAllowedDocumentField(field);
    })
    .flatMap((field) => {
      const value = doc.get(field);
      if (isDocument(value)) {
        return getDefaultDocumentFields(value).map((innerField) => {
          return [field, innerField].join('.');
        });
      } else if (Array.isArray(value) && isDocument(value[0])) {
        return getDefaultDocumentFields(value[0]).map((innerField) => {
          return [field, innerField].join('.');
        });
      } else {
        return [field];
      }
    });
}

function isAllowedDocumentField(field) {
  return !field.startsWith('_') && !DISALLOWED_FIELDS.includes(field);
}

function getDefaultObjectFields(obj = {}) {
  return Object.entries(obj).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return getDefaultFields(value).map((field) => {
        return [key, field].join('.');
      });
    } else if (isObject(value)) {
      return getDefaultFields([value]).map((field) => {
        return [key, field].join('.');
      });
    } else {
      return [key];
    }
  });
}

function isObject(val) {
  return val && Object.getPrototypeOf(val) === Object.prototype;
}

function isUpload(val, options) {
  const { doc, base, field } = options;
  const schema = doc?.schema;
  if (!schema) {
    return;
  }

  const schemaType = schema.path(field) || schema.path(base);
  return schemaType?.options?.ref === 'Upload';
}

function getUploadUrl(item) {
  const id = isObjectId(item) ? item : item.id;
  return `${API_URL}/1/uploads/${id}/raw`;
}

function formatValue(value, options) {
  if (isUpload(value, options)) {
    return getUploadUrl(value);
  } else if (value instanceof Date) {
    return value.toISOString();
  } else if (Array.isArray(value)) {
    if (typeof value[0] === 'object') {
      return value.map((v) => JSON.stringify(v));
    } else {
      return value.map((v) => v.toString());
    }
  } else if (isObject(value)) {
    return JSON.stringify(value);
  } else if (typeof value === 'number') {
    return formatter.format(value);
  } else {
    return value?.toString() || '';
  }
}

function isObjectId(val) {
  return mongoose.isObjectIdOrHexString(val);
}

// Casing

function convertCase(obj, options) {
  let { readableHeaders, getHeader } = options;

  if (!readableHeaders && !getHeader) {
    return obj;
  }

  const result = {};

  for (let [key, value] of Object.entries(obj)) {
    let header;

    if (getHeader) {
      header = getHeader(key);
    }
    if (!header && readableHeaders) {
      header = startCase(key);
    }

    result[header || key] = value;
  }

  return result;
}

module.exports = {
  csvExport,
  exportValidation,
};
