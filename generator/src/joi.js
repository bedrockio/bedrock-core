const { replaceBlock } = require('./source');

function replaceSchema(source, schemaType, options) {
  const schema = outputSchema(options.schema, schemaType);
  return replaceBlock(source, schema, schemaType);
}

function outputSchema(schema, schemaType) {
  const str = schema.map((field) => {
    return outputField(field, schemaType);
  })
    .filter((f) => f)
    .join(',\n');
  return str ? str + ',' : '';
}

function outputField(field, schemaType) {
  let { name, type, private } = field;
  if (private) {
    return '';
  }
  let required = schemaType === 'create' && field.required;
  type = getJoiType(type);
  return `${name}: ${type}.${required ? 'required' : 'optional'}()`;
}

function getJoiType(type) {
  switch (type) {
    case 'Upload':
    case 'ObjectId':
      return 'Joi.string()';
    case 'UploadArray':
    case 'ObjectIdArray':
    case 'StringArray':
      return 'Joi.array().items(Joi.string())';
    case 'Date':
      return 'Joi.date().iso()';
    default:
      return `Joi.${type.toLowerCase()}()`;
  }
}

module.exports = {
  replaceSchema,
};
