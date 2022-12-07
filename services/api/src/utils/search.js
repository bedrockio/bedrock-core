const yd = require('@bedrockio/yada');

const DEFAULT_LIMIT = 50;
const DEFAULT_SORT = { field: 'createdAt', order: 'desc' };

function searchValidation(options = {}) {
  const { sort = DEFAULT_SORT, limit = DEFAULT_LIMIT, ...rest } = options;
  return {
    ids: yd.array(yd.string()),
    keyword: yd.string(),
    skip: yd.number().default(0),
    sort: yd
      .object({
        field: yd.string().required(),
        order: yd.string().allow('desc', 'asc').required(),
      })
      .default(sort),
    limit: yd.number().positive().default(limit),
    ...rest,
  };
}

module.exports = {
  DEFAULT_SORT,
  DEFAULT_LIMIT,
  searchValidation,
};
