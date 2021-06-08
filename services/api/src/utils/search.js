const Joi = require('joi');
const PassThrough = require('stream').PassThrough;
const csv = require('fast-csv');

function searchValidation(options = {}) {
  const { limit = 50, sortField = 'createdAt', sortOrder = 'desc' } = options;
  return {
    ids: Joi.array().items(Joi.string()),
    keyword: Joi.string().allow(''),
    startAt: Joi.date(),
    endAt: Joi.date(),
    skip: Joi.number().default(0),
    sort: Joi.object({
      field: Joi.string().required(),
      order: Joi.string().allow('desc', 'asc').required(),
    }).default({
      field: sortField,
      order: sortOrder,
    }),
    limit: Joi.number().positive().default(limit),
  };
}

function exportValidation(options = {}) {
  const { filename = 'export.csv' } = options;
  return {
    filename: Joi.string().default(filename),
    format: Joi.string().allow('json', 'csv').default('json'),
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
  searchExport,
};
