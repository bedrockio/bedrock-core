const Joi = require('joi');

function getValidatorForDefinition(definition) {
  return getObjectValidator(definition)
    .append({
      id: Joi.any().strip(),
      createdAt: Joi.any().strip(),
      updatedAt: Joi.any().strip(),
      deletedAt: Joi.any().strip(),
    })
    .min(1);
}

function getObjectValidator(obj) {
  const map = {};
  for (let [key, field] of Object.entries(obj)) {
    map[key] = getValidatorForField(field);
  }
  return Joi.object(map);
}

function getValidatorForField(field) {
  if (Array.isArray(field)) {
    return Joi.array().items(
      getValidatorForField(field[0])
    );
  }
  const { type, ...options } = getField(field);
  if (!type || type === 'Mixed' || typeof type === 'object') {
    // Mixed fields either have no type, type "mixed",
    // or "type" as a nested object.
    return getObjectValidator(field);
  }
  let validator = getValidatorForType(type);
  if (options.required) {
    validator = validator.required();
  }
  if (options.enum) {
    validator = validator.valid(...options.enum);
  }
  if (options.match) {
    validator = validator.pattern(RegExp(options.match));
  }
  if (options.min || options.minLength) {
    validator = validator.min(options.min || options.minLength);
  }
  if (options.max || options.maxLength) {
    validator = validator.max(options.max || options.maxLength);
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
