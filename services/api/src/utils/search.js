const yd = require('@bedrockio/yada');
const { OBJECT_ID_SCHEMA } = require('./validation');

const DEFAULT_LIMIT = 50;
const DEFAULT_SORT = { field: 'createdAt', order: 'desc' };

function searchValidation(options = {}) {
  const { sort = DEFAULT_SORT, limit = DEFAULT_LIMIT, ...rest } = options;
  return {
    ids: yd.array(OBJECT_ID_SCHEMA),
    keyword: yd.string().description('A keyword to perform a text search against.'),
    skip: yd.number().default(0).description('Number of records to skip.'),
    sort: yd
      .object({
        field: yd.string().required(),
        order: yd.string().allow('desc', 'asc').required(),
      })
      .default(sort)
      .description('An object describing the sort order of results.'),
    limit: yd.number().positive().default(limit).description('Limits the number of results.'),
    ...rest,
  };
}

module.exports = {
  DEFAULT_SORT,
  DEFAULT_LIMIT,
  searchValidation,
};
