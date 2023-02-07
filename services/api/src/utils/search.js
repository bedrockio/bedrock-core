const Joi = require('joi');

const DEFAULT_LIMIT = 50;
const DEFAULT_SORT = { field: 'createdAt', order: 'desc' };

function searchValidation(options = {}) {
  const { sort = DEFAULT_SORT, limit = DEFAULT_LIMIT, ...rest } = options;
  return {
    ids: Joi.array().items(Joi.string()),
    keyword: Joi.string().allow(''),
    include: Joi.string(),
    skip: Joi.number().default(0),
    sort: Joi.object({
      field: Joi.string().required(),
      order: Joi.string().allow('desc', 'asc').required(),
    }).default(sort),
    limit: Joi.number().positive().default(limit),
    ...rest,
  };
}

module.exports = {
  DEFAULT_SORT,
  DEFAULT_LIMIT,
  searchValidation,
};
