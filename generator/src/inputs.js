const { startCase } = require('lodash');
const { replaceBlock } = require('./source');
const { block } = require('./util');

function replaceInputs(source, options) {
  return replaceBlock(source, getInputs(options), 'fields');
}

function getInputs(options) {
  return options.schema
    .map((field) => {
      const { private } = field;
      if (!private) {
        return getInputForField(field, options);
      }
    })
    .filter((f) => f)
    .join('\n');
}

function getInputForField(field, options) {
  switch (field.type) {
    case 'String':
      return getStringInput(field, options);
    case 'Number':
      return getNumberInput(field, options);
    case 'Text':
      return getTextInput(field, options);
    case 'Date':
      return getDateInput(field, options);
    case 'Boolean':
      return getBooleanInput(field, options);
    case 'ObjectId':
      return getReferenceInput(field, options);
    case 'StringArray':
      return getStringArrayInput(field, options);
    case 'Upload':
    case 'UploadArray':
      return getUploadInput(field, options);
  }
}

function getStringInput(field, options) {
  const { name, required } = field;
  if (field.enum) {
    return block`
      <Form.Dropdown
        ${required ? 'required' : ''}
        selection
        name="${name}"
        label="${startCase(name)}"
        value={${options.camelLower}.${name} || ''}
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
        value={${options.camelLower}.${name} || ''}
        onChange={this.setField}
      />
    `;
  }
}

function getStringArrayInput(field, options) {
  const { name, required } = field;
  if (field.enum) {
    return block`
      <Form.Dropdown
        ${required ? 'required' : ''}
        multiple
        selection
        name="${name}"
        label="${startCase(name)}"
        value={${options.camelLower}.${name} || []}
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
          ${options.camelLower}.${name}?.map((value) => {
            return {
              value,
              text: value,
            };
          }) || []
        }
        onAddItem={(evt, { name, value }) => {
          this.setField(evt, {
            name,
            value: [...${options.camelLower}.${name} || [], value],
          });
        }}
        onChange={this.setField}
        value={${options.camelLower}.${name} || []}
      />
    `;
  }
}

function getTextInput(field, options) {
  const { name, required } = field;
  return block`
    <Form.TextArea
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      value={${options.camelLower}.${name} || ''}
      onChange={this.setField}
    />
  `;
}

function getDateInput(field, options) {
  const { name, required } = field;
  return block`
    <DateField
      ${field.time ? 'time' : ''}
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      value={${options.camelLower}.${name} || ''}
      onChange={this.setField}
    />
  `;
}

function getReferenceInput(field, options) {
  const { ref, name, type, required } = field;
  const { pluralLower } = options.secondaryReferences.find((r) => {
    return r.camelUpper === ref;
  });
  const isArray = type.match(/Array/);
  return block`
    <ReferenceField
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      value={${options.camelLower}.${name}${isArray ? ' || []' : ''}}
      onChange={(data) => this.setField(null, data)}
      resource="${pluralLower}"
    />
  `;
}

function getUploadInput(field, options) {
  const { name, type, required } = field;
  const isArray = type.match(/Array/);
  return block`
    <UploadsField
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      value={${options.camelLower}.${name}${isArray ? ' || []' : ''}}
      onChange={(data) => this.setField(null, data)}
      onError={(error) => this.setState({ error })}
    />
  `;
}

function getNumberInput(field, options) {
  const { name, required, min, max } = field;
  return block`
    <Form.Input
      ${required ? 'required' : ''}
      type="number"
      name="${name}"
      label="${startCase(name)}"
      value={${options.camelLower}.${name}?.toFixed() || ''}
      onChange={this.setNumberField}
      ${min ? `min="${min}"` : ''}
      ${max ? `max="${max}"` : ''}
    />
  `;
}

function getBooleanInput(field, options) {
  const { name, required } = field;
  return block`
    <Form.Checkbox
      ${required ? 'required' : ''}
      name="${name}"
      label="${startCase(name)}"
      checked={${options.camelLower}.${name}}
      onChange={this.setCheckedField}
    />
  `;
}

module.exports = {
  replaceInputs,
};
