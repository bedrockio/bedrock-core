const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId;
const PassThrough = require('stream').PassThrough;
const csv = require('fast-csv');

function searchValidation(options = {}) {
  const { limit = 50, sortField = 'createdAt', sortOrder = 'desc' } = options;
  return {
    startAt: Joi.date(),
    endAt: Joi.date(),
    skip: Joi.number().default(0),
    sort: Joi.object({
      field: Joi.string().required(),
      order: Joi.string().required(),
    }).default({
      field: sortField,
      order: sortOrder,
    }),
    limit: Joi.number().positive().default(limit),
    keywords: Joi.string(),
  };
}

function exportValidation(options = {}) {
  const { filename = 'export.csv' } = options;
  return {
    filename: Joi.string().default(filename),
    format: Joi.string().allow('json', 'csv').default('json'),
  };
}

function getSearchQuery(body, options = {}) {
  const { keywords, startAt, endAt } = body;
  const query = { deletedAt: { $exists: false } };
  if (startAt || endAt) {
    query.createdAt = {};
    if (startAt) {
      query.createdAt.$gte = startAt;
    }
    if (endAt) {
      query.createdAt.$lte = endAt;
    }
  }
  if (keywords && options.keywordsFields) {
    query.$or = options.keywordsFields.map((field) => {
      return {
        [field]: keywords,
      };
    });
    if (ObjectId.isValid(keywords)) {
      query.$or.push({
        _id: keywords,
      });
    }
  }
  return query;
}

async function search(model, query, body) {
  const { sort, skip, limit } = body;
  let find = model
    .find(query)
    .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit);
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
}

function searchExport(ctx, data) {
  const { format, filename } = ctx.request.body;
  if (format === 'csv') {
    const csvStream = csv.format({ headers: true, objectMode: true, delimiter: ';' });

    ctx.body = csvStream.pipe(PassThrough());

    data.forEach((item) => {
      csvStream.write(exports.flatten(item));
    });
    ctx.set('Content-Disposition', `attachment; filename=${filename}`);
    ctx.set('Content-Type', 'text/csv');
    csvStream.end();
    return true;
  }
  return false;
}

module.exports = {
  searchValidation,
  exportValidation,
  getSearchQuery,
  search,
  searchExport,
};
