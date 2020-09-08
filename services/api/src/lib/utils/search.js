const ObjectId = require('mongoose').Types.ObjectId;
const Joi = require('@hapi/joi');
const PassThrough = require('stream').PassThrough;
const csv = require('fast-csv');
const validate = require('../../middlewares/validate');

exports.escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const numberFormatter = Intl.NumberFormat('en');

exports.flatten = function flatten(obj, opt_out, opt_paths) {
  const out = opt_out || {};
  const paths = opt_paths || [];
  return Object.getOwnPropertyNames(obj).reduce(function (out, key) {
    paths.push(key);

    if (typeof obj[key] === 'number') {
      out[paths.join('.')] = numberFormatter.format(obj[key]);
    } else if (ObjectId.isValid(obj[key])) {
      out[paths.join('.')] = obj[key].toString();
    } else if (obj[key] instanceof Date) {
      out[paths.join('.')] = obj[key].toISOString();
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !!obj[key]) {
      flatten(obj[key], out, paths);
    } else {
      out[paths.join('.')] = obj[key];
    }
    paths.pop();
    return out;
  }, out);
};

exports.commonSearchValidation = function ({
  defaultExportFilename = 'export.csv',
  defaultSortField = undefined,
  defaultSortOrder = 'desc',
  defaultDateField = 'createdAt',
  exactStringMatchFields = [],
} = {}) {
  if (!defaultSortField) {
    defaultSortField = defaultDateField;
  }
  const validation = {
    filename: Joi.string().default(defaultExportFilename),
    from: Joi.date(),
    to: Joi.date(),
    format: Joi.string().allow('json', 'csv').default('json'),
    skip: Joi.number().default(0),
    sort: Joi.object({
      field: Joi.string().required(),
      order: Joi.string().allow('asc', 'desc').required(),
    }).default({
      field: defaultSortField,
      order: defaultSortOrder,
    }),
    id: Joi.string(),
    ids: Joi.array().items(Joi.string()),
    searchId: Joi.string(),
    limit: Joi.number().positive().default(50),
  };
  exactStringMatchFields.forEach((key) => {
    validation[key] = Joi.string();
  });
  return validation;
};

exports.commonSearchCreateQuery = function (body, options = {}) {
  const { from, to, searchId, id, ids = [] } = body;
  const query = { deletedAt: { $exists: false } };
  if (id) {
    query._id = id;
  }
  if (ids.length) {
    query._id = { $in: ids };
  }
  if (from || to) {
    query[options.defaultDateField || 'createdAt'] = { $gte: from, $lt: to };
  }
  if (searchId && options.searchFields) {
    query.$or = options.searchFields.map((field) => {
      return {
        [field]: {
          $regex: searchId,
          $options: 'i',
        },
      };
    });
    if (ObjectId.isValid(searchId)) {
      query.$or.push({
        _id: searchId,
      });
    }
  }
  if (options.exactStringMatchFields) {
    options.exactStringMatchFields.forEach((key) => {
      if (body[key]) {
        query[key] = body[key];
      }
    });
  }
  return query;
};

exports.commonSearchFind = async function (body, model, query, populateFields) {
  const { sort, skip, limit } = body;

  let find = model
    .find(query)
    .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit);
  populateFields.forEach((field) => {
    find = find.populate(field);
  });
  const data = await find.exec();

  const total = await model.countDocuments(query);
  return {
    data,
    meta: {
      total,
      skip,
      limit,
    },
  };
};

exports.commonSearchExport = function (ctx, data) {
  const { format, filename } = ctx.request.body;
  if (format === 'csv') {
    const csvStream = csv.format({ headers: true, objectMode: true, delimiter: ';' });

    ctx.body = csvStream.pipe(PassThrough());

    data.forEach((item) => {
      csvStream.write(exports.flatten(item.toResource()));
    });
    ctx.set('Content-Disposition', `attachment; filename=${filename}`);
    ctx.set('Content-Type', 'text/csv');
    csvStream.end();
    return true;
  }
  return false;
};

exports.commonSearch = function ({
  model,
  validateBody,
  defaultExportFilename,
  defaultSortField,
  defaultSortOrder,
  defaultDateField,
  createQuery,
  searchFields,
  populateFields,
  exactStringMatchFields,
}) {
  return [
    validate({
      body: {
        ...exports.commonSearchValidation({
          defaultExportFilename,
          defaultSortField,
          defaultSortOrder,
          exactStringMatchFields,
        }),
        ...(validateBody || {}),
      },
    }),
    async (ctx) => {
      const baseQuery = exports.commonSearchCreateQuery(ctx.request.body, {
        searchFields,
        defaultDateField,
        exactStringMatchFields,
      });

      const query = await createQuery(ctx, baseQuery);
      const { data, meta } = await exports.commonSearchFind(ctx.request.body, model, query, populateFields || []);

      if (exports.commonSearchExport(ctx, data)) {
        return;
      }

      ctx.body = {
        data: data.map((i) => i.toResource()),
        meta,
      };
    },
  ];
};
