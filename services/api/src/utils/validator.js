const Joi = require('joi');

function getValidatorForDefinition(definition, options) {
  return getObjectValidator(definition, options)
    .append({
      id: Joi.any().strip(),
      createdAt: Joi.any().strip(),
      updatedAt: Joi.any().strip(),
      deletedAt: Joi.any().strip(),
    })
    .min(1);
}

function getObjectValidator(obj, options) {
  const map = {};
  for (let [key, field] of Object.entries(obj)) {
    map[key] = getValidatorForField(field, options);
  }
  return Joi.object(map);
}

function getValidatorForField(field, options = {}) {
  if (Array.isArray(field)) {
    return Joi.array().items(
      getValidatorForField(field[0])
    );
  }
  const { type, ...params } = getField(field);
  if (!type || type === 'Mixed' || typeof type === 'object') {
    // Mixed fields either have no type, type "mixed",
    // or "type" as a nested object.
    return getObjectValidator(field, options);
  }
  let validator = getValidatorForType(type);
  if (params.required && !options.skipRequired) {
    validator = validator.required();
  }
  if (params.enum) {
    validator = validator.valid(...params.enum);
  }
  if (params.match) {
    validator = validator.pattern(RegExp(params.match));
  }
  if (params.min || params.minLength) {
    validator = validator.min(params.min || params.minLength);
  }
  if (params.max || params.maxLength) {
    validator = validator.max(params.max || params.maxLength);
  }
  return validator;
}

function getValidatorForType(type) {
  if (typeof type === 'function') {
    type = type.name;
  }
  switch (type) {
    case 'String':
      return Joi.string();
    case 'Number':
      return Joi.number();
    case 'Boolean':
      return Joi.boolean();
    case 'Date':
      return Joi.date().iso();
    case 'ObjectId':
      return Joi.string().hex().length(24);
    default:
      return Joi.object();
  }
}

function getField(field) {
  if (typeof field === 'object') {
    return field;
  } else {
    return {
      type: field,
    };
  }
}

module.exports = {
  getValidatorForDefinition,
};
