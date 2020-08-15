const { startCase } = require('lodash');
const { replaceBlock } = require('./source');
const { block } = require('./util');

function replaceInputs(source, options) {
  return replaceBlock(source, getInputs(options), 'fields');
}

function getInputs(options) {
  const { camelLower } = options;
  return options.schema
    .map((field) => {
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
    case 'String':
      return getStringInput(field, camelLower);
    case 'Number':
      return getNumberInput(field, camelLower);
    case 'Text':
      return getTextInput(field, camelLower);
    case 'Date':
      return getDateInput(field, camelLower);
    case 'Boolean':
      return getBooleanInput(field, camelLower);
    case 'StringArray':
      return getStringArrayInput(field, camelLower);
    case 'Upload':
    case 'UploadArray':
      return getUploadInput(field, camelLower);
  }
}

function getStringInput(field, camelLower) {
  const { name, required } = field;
  if (field.enum) {
    return block`
      <Form.Dropdown
        ${required ? 'required' : ''}
        selection
        name="${name}"
        label="${startCase(name)}"
        value={${camelLower}.${name} || ''}
        options={[
        ${field.enum
          .map((val) => {
            return `
          {
            text: "${val}",
            value: "${val}",
          }`;
          })
          .join(',\n')}
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

function getStringArrayInput(field, camelLower) {
  const { name, required } = field;
  if (field.enum) {
    return block`
      <Form.Dropdown
        ${required ? 'required' : ''}
        multiple
        selection
        name="${name}"
        label="${startCase(name)}"
        value={${camelLower}.${name} || []}
        options={[
        ${field.enum
          .map((val) => {
            return `
          {
            text: "${val}",
            value: "${val}",
          }`;
          })
          .join(',\n')}
        ]}
        onChange={this.setField}
      />
    `;
  } else {
    return block`
      <Form.Dropdown
        ${required ? 'required' : ''}
        search
        selection
        multiple
        allowAdditions
        name="${name}"
        label="${startCase(name)}"
        options={
          ${camelLower}.${name}?.map((value) => {
            return {
              value,
              text: value,
            };
          }) || []
        }
        onAddItem={(evt, { name, value }) => {
          this.setField(evt, {
            name,
            value: [...${camelLower}.${name} || [], value],
          });
        }}
        onChange={this.setField}
        value={${camelLower}.${name} || []}
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

function getDateInput(field, camelLower) {
  const { name, required } = field;
  return block`
    <DateField
      ${field.time ? 'time' : ''}
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      value={${camelLower}.${name} || ''}
      onChange={this.setField}
    />
  `;
}

function getUploadInput(field, camelLower) {
  const { name, type, required } = field;
  const isArray = type.match(/Array/);
  return block`
    <UploadsField
      name="${name}"
      ${required ? 'required' : ''}
      label="${startCase(name)}"
      value={${camelLower}.${name}${isArray ? ' || []' : ''}}
      onChange={(data) => this.setField(null, data)}
      onError={(error) => this.setState({ error })}
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

function getBooleanInput(field, camelLower) {
  const { name, required } = field;
  return block`
    <Form.Checkbox
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      checked={${camelLower}.${name}}
      onChange={this.setCheckedField}
    />
  `;
}

module.exports = {
  replaceInputs,
};
