const yd = require('@bedrockio/yada');
const csv = require('fast-csv');
const mongoose = require('mongoose');
const PassThrough = require('stream').PassThrough;
const { ObjectId } = mongoose.Types;
const { serializeObject } = require('./serialize');

const formatter = Intl.NumberFormat('us');

function csvExport(ctx, data, options = {}) {
  const { filename } = options;
  const csvStream = csv.format({ headers: true, objectMode: true });

  ctx.body = csvStream.pipe(PassThrough());

  data.forEach((item) => {
    item = serializeObject(item, ctx);
    csvStream.write(exportItem(item, options));
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

function exportItem(item, options, result = {}, rootPath = []) {
  if (item && typeof item === 'object' && !(item instanceof Date)) {
    if (item.toObject) {
      item = item.toObject();
    }
    const entries = Object.entries(item).map(([key, val]) => {
      const path = [...rootPath, key];
      const fullKey = getFullKey(path);
      return {
        key,
        val,
        path,
        fullKey,
      };
    });
    entries.sort((a, b) => {
      return compareKeys(a.fullKey, b.fullKey, options);
    });
    for (let { key, val, path, fullKey } of entries) {
      const isId = key === 'id' || val instanceof ObjectId;
      if (isId) {
        val = val.toString();
      }
      if (isExplicitlyIncluded(fullKey, options)) {
        exportItem(val, { ...options, rootIncluded: true }, result, path);
      } else if (isImplicitlyIncluded(fullKey, options) && !isId) {
        exportItem(val, options, result, path);
      }
    }
  } else {
    result[getFullKey(rootPath)] = formatValue(item);
  }
  return result;
}

function isExplicitlyIncluded(fullKey, options = {}) {
  const { include = [] } = options;
  return include.includes(fullKey);
}

function isImplicitlyIncluded(fullKey, options) {
  const { include, exclude = [], rootIncluded } = options;
  if (exclude.includes(fullKey)) {
    return false;
  } else if (rootIncluded) {
    return true;
  } else if (include) {
    return include.some((str) => {
      return str.startsWith(fullKey);
    });
  }
  return true;
}

function compareKeys(key1, key2, options) {
  const { include } = options;
  if (!include) {
    return 0;
  }
  return getKeyRank(key1, include) - getKeyRank(key2, include);
}

function getKeyRank(key, arr) {
  const index = arr.findIndex((str) => {
    return str.startsWith(key);
  });
  return index === -1 ? arr.length : index;
}

function getFullKey(path) {
  return path.join('.');
}

function formatValue(value) {
  if (typeof value === 'number') {
    return formatter.format(value);
  }
  if (ObjectId.isValid(value)) {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object' && Array.isArray(value)) {
    if (typeof value[0] === 'object') {
      return value.map((v) => JSON.stringify(v));
    } else {
      return value.map((v) => v.toString());
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (!value) {
    return '';
  }
  return value.toString();
}

module.exports = {
  csvExport,
  exportValidation,
};
