const { replaceBlock } = require('./source');

function replaceSchema(source, schema, operation) {
  const output = outputSchema(schema, operation);
  return replaceBlock(source, output, operation);
}

function outputSchema(schema, operation) {
  const str = schema.map((field) => {
    return outputField(field, operation);
  })
    .filter((f) => f)
    .join(',\n');
  return str ? str + ',' : '';
}

function outputField(field, operation) {
  let { name, schemaType } = field;
  let required = operation === 'create' && field.required;
  const type = getJoiType(schemaType);
  return `${name}: ${type}.${required ? 'required' : 'optional'}()`;
}

function getJoiType(schemaType) {
  switch (schemaType) {
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
      return `Joi.${schemaType.toLowerCase()}()`;
  }
}

module.exports = {
  replaceSchema,
};
