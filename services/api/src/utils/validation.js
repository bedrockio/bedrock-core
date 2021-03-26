const Joi = require('joi');

const FIXED_SCHEMAS = {
  email: Joi.string().lowercase().email(),
};

function getJoiSchema(attributes, options = {}) {
  const { appendSchema } = options;
  let schema = getObjectSchema(attributes, options).min(1);
  if (appendSchema) {
    if (Joi.isSchema(appendSchema)) {
      schema = schema.concat(appendSchema);
    } else {
      schema = schema.append(appendSchema);
    }
  }
  return schema;
}

function getMongooseValidator(field) {
  const schema = getSchemaForField(field);
  return (val) => {
    const { error } = schema.validate(val);
    if (error) {
      throw error;
    }
    return true;
  };
}

function getFixedSchema(name) {
  const schema = FIXED_SCHEMAS[name];
  if (!schema) {
    throw new Error(`Cannot find schema for ${name}.`);
  }
  return schema;
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

function getSchemaForField(field, options = {}) {
  if (Array.isArray(field)) {
    return Joi.array().items(
      getSchemaForField(field[0], options)
    );
  }
  const { type, validate, ...rest } = normalizeField(field);
  if (type === 'Mixed') {
    return getObjectSchema(rest, options);
  }
  let schema;

  if (validate) {
    schema = getFixedSchema(validate);
  } else {
    schema = getSchemaForType(type);
  }

  if (field.required && !options.skipRequired) {
    schema = schema.required();
  } else {
    // TODO: for now we allow both empty strings and null
    // as a potential signal for "set but non-existent".
    // Is this ok? Do we not want any falsy fields in the
    // db whatsoever?
    schema = schema.allow('', null);
  }


  if (field.enum) {
    schema = schema.valid(...field.enum);
  }
  if (field.match) {
    schema = schema.pattern(RegExp(field.match));
  }
  if (field.min || field.minLength) {
    schema = schema.min(field.min || field.minLength);
  }
  if (field.max || field.maxLength) {
    schema = schema.max(field.max || field.maxLength);
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
      throw new TypeError(`Unknown schema type ${type}`);
  }
}

function normalizeField(field) {
  // Normalize different mongoose definition styles:
  // { name: String }
  // { type: { type: String } // allow "type" field
  // { object: { type: Mixed }
  if (typeof field === 'object') {
    return {
      ...field,
      type: field.type?.type || field.type || 'Mixed',
    };
  } else {
    return { type: field };
  }
}

module.exports = {
  getJoiSchema,
  getMongooseValidator,
};
