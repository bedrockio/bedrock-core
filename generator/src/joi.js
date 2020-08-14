const { replaceBlock } = require('./source');

function replaceSchema(source, schema, operation) {
  const output = outputSchema(schema, operation);
  return replaceBlock(source, output, operation);
}

function outputSchema(schema, operation) {
  const str = schema
    .map((field) => {
      return outputField(field, operation);
    })
    .filter((f) => f)
    .join(',\n');
  return str ? str + ',' : '';
}

function outputField(field, operation) {
  const joiType = getJoiType(field);
  const required = fieldIsRequired(field);
  let suffix = '';
  if (operation === 'update') {
    if (!required) {
      return '';
    } else {
      suffix = '.optional()';
    }
  } else if (operation === 'create') {
    if (required) {
      suffix = '.required()';
    }
  }
  return `${field.name}: ${joiType}${suffix}`;
}

function fieldIsRequired(field) {
  return field.required && !('default' in field);
}

function getJoiType(field, type) {
  switch (type || field.type) {
    case 'Upload':
    case 'ObjectId':
      return 'Joi.string()';
    case 'UploadArray':
    case 'ObjectIdArray':
      return 'Joi.array().items(Joi.string())';
    case 'StringArray':
      return `Joi.array().items(${getJoiType(field, field.schemaType)})`;
    case 'Date':
      return 'Joi.date().iso()';
    default:
      return getJoiDefaultType(field);
  }
}

function getJoiDefaultType(field) {
  let src = `Joi.${field.schemaType.toLowerCase()}()`;
  if (field.enum) {
    const options = field.enum.map((option) => {
      return typeof option === 'string' ? `'${option}'` : option;
    });
    src += `.allow(${options.join(', ')})`;
  }
  return src;
}

module.exports = {
  replaceSchema,
};
