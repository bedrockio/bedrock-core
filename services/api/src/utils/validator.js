const Joi = require('joi');

function getValidatorForDefinition(definition) {
  const obj = {
    id: Joi.any().strip(),
    createdAt: Joi.any().strip(),
    updatedAt: Joi.any().strip(),
    deletedAt: Joi.any().strip(),
  };
  for (let [key, field] of Object.entries(definition)) {
    obj[key] = getValidatorForField(field);
  }
  return Joi.object(obj).min(1);
}

function getValidatorForField(field) {
  const { type, ...options } = getField(field);
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
  if (typeof type === 'string') {
    type = global[type];
  }
  switch (type) {
    case String:
      return Joi.string();
    case Number:
      return Joi.number();
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
