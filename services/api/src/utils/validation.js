const Joi = require('joi');

const EMAIL_SCHEMA = Joi.string().lowercase().email().required();

function getJoiSchemaForDefinition(definition, options = {}) {
  return getObjectSchema(definition, options).min(1);
}

function getMongooseValidator(type) {
  if (type === 'email') {
    return joiSchemaToMongooseValidator(EMAIL_SCHEMA);
  }
  throw new Error(`No validator for ${type}.`);
}

function getObjectSchema(obj, options) {
  const map = {};
  const { disallowField, stripFields = [] } = options;
  for (let [key, field] of Object.entries(obj)) {
    if (disallowField && disallowField(key)) {
      continue;
    }
    map[key] = getSchemaForField(field, options);
  }
  for (let key of stripFields) {
    map[key] = Joi.any().strip();
  }
  return Joi.object(map);
}

function getSchemaForField(field, options) {
  if (Array.isArray(field)) {
    return Joi.array().items(
      getSchemaForField(field[0], options)
    );
  }
  const { type, ...params } = getField(field);
  if (!type || type === 'Mixed' || typeof type === 'object') {
    // Mixed fields either have no type, type "mixed",
    // or "type" as a nested object.
    return getObjectSchema(field, options);
  }
  let schema = getSchemaForType(type);
  if (params.required && !options.skipRequired) {
    schema = schema.required();
  }
  if (params.enum) {
    schema = schema.valid(...params.enum);
  }
  if (params.match) {
    schema = schema.pattern(RegExp(params.match));
  }
  if (params.min || params.minLength) {
    schema = schema.min(params.min || params.minLength);
  }
  if (params.max || params.maxLength) {
    schema = schema.max(params.max || params.maxLength);
  }
  return schema;
}

function getSchemaForType(type) {
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

function joiSchemaToMongooseValidator(schema) {
  return (val) => {
    const { error } = schema.validate(val);
    if (error) {
      throw error;
    }
    return true;
  };
}

module.exports = {
  getJoiSchemaForDefinition,
  getMongooseValidator,
};
