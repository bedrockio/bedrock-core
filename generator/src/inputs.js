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
    case 'Text':   return getTextInput(field, camelLower);
  }
}

function getStringInput(field, camelLower) {
  const { name, required } = field;
  if (field.enum) {
    return block`
      <Form.Dropdown
        selection
        ${required ? 'required' : ''}
        name="${name}"
        label="${startCase(name)}"
        value={${camelLower}.${name} || ''}
        options={[
        ${field.enum.map((val) => {
          return `
          {
            text: "${val}",
            value: "${val}",
          }`;
        }).join(',\n')}
        ]}
        onChange={this.setField}
      />
    `;
  } else {
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
}

function getTextInput(field, camelLower) {
  const { name, required } = field;
  return block`
    <Form.TextArea
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      value={${camelLower}.${name} || ''}
      onChange={this.setField}
    />
  `;
}

function getNumberInput(field, camelLower) {
  const { name, required, min, max } = field;
  return block`
    <Form.Input
      ${required ? 'required' : ''}
      type="number"
      name="${name}"
      label="${startCase(name)}"
      value={${camelLower}.${name}?.toFixed() || ''}
      onChange={this.setNumberField}
      ${min ? `min="${min}"` : ''}
      ${max ? `max="${max}"` : ''}
    />
  `;
}

module.exports = {
  replaceInputs,
};
