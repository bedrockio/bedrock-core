const { startCase } = require('lodash');
const { replaceBlock } = require('./source');
const { block } = require('./util');

function replaceFilters(source, options) {
  return replaceBlock(source, getFilters(options), 'filters');
}

function getFilters(options) {
  const { camelLower } = options;
  return options.schema.map((field) => {
    const { private } = field;
    if (!private) {
      return getInputForField(field, camelLower);
    }
  })
    .filter((f) => f)
    .join('\n');
}

function getInputForField(field, camelLower) {
  switch (field.type) {
    case 'String': return getInputFilter(field, camelLower);
    case 'Number': return getInputFilter(field, camelLower);
  }
}

function getInputFilter(field) {
  const { name } = field;
  return block`
    <Filters.Input label="${startCase(name)}" name="${name}" />
  `;
}

module.exports = {
  replaceFilters,
};
