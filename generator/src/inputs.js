const { startCase } = require('lodash');
const { replaceBlock } = require('./source');
const { block } = require('./util');

function replaceInputs(source, options) {
  return replaceBlock(source, getInputs(options), 'fields');
}

function getInputs(options) {
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
    case 'String': return getStringInput(field, camelLower);
    case 'Number': return getNumberInput(field, camelLower);
  }
}

function getStringInput(field, camelLower) {
  const { name, required } = field;
  return block`
    <Form.Input
      ${required ? 'required' : ''}
      type="text"
      name="${name}"
      label="${startCase(name)}"
      value={${camelLower}.${name} || ''}
      onChange={this.setField}
    />
  `;
}

function getNumberInput(field, camelLower) {
  const { name, required } = field;
  return block`
    <Form.Input
      ${required ? 'required' : ''}
      type="number"
      name="${name}"
      label="${startCase(name)}"
      value={${camelLower}.${name} || ''}
      onChange={this.setField}
    />
  `;
}

module.exports = {
  replaceInputs,
};
