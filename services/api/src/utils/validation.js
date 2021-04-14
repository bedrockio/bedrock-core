const Joi = require('joi');

const EMAIL_SCHEMA = Joi.string().lowercase().email();
const OBJECT_ID_SCHEMA = Joi.string().hex().length(24);

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

function getMongooseValidator(type, required) {
  if (type === 'email') {
    return joiSchemaToMongooseValidator(EMAIL_SCHEMA, required);
  }
  throw new Error(`No validator for ${type}.`);
}

function getArraySchema(obj, options) {
  let schema = Joi.array();
  if (Array.isArray(obj)) {
    schema = schema.items(getSchemaForField(obj[0], options));
  }
  return schema;
}

function getObjectSchema(obj, options) {
  const map = {};
  const { transformField, stripFields = [] } = options;
  for (let [key, field] of Object.entries(obj)) {
    if (key === 'type' && typeof field !== 'object') {
      // Ignore "type" field unless it's an object like
      // type: { type: String }
      continue;
    }
    if (transformField) {
      field = transformField(key, field);
    }
    if (field) {
      if (Joi.isSchema(field)) {
        map[key] = field;
      } else {
        map[key] = getSchemaForField(field, options);
      }
    }
  }
  for (let key of stripFields) {
    map[key] = Joi.any().strip();
  }
  return Joi.object(map);
}

function getSchemaForField(field, options) {
  const type = getFieldType(field);
  if (type === 'Array') {
    return getArraySchema(field, options);
  } else if (type === 'Mixed') {
    return getObjectSchema(field, options);
  }
  let schema = getSchemaForType(type);
  if (field.required && !options.skipRequired) {
    schema = schema.required();
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
      return Joi.custom((val) => {
        const id = String(val.id || val);
        Joi.assert(id, OBJECT_ID_SCHEMA);
        return id;
      });
    default:
      throw new TypeError(`Unknown schema type ${type}`);
  }
}

function getFieldType(field) {
  // Normalize different type definitions including Mongoose types as well
  // as strings. Be careful here of nested type definitions.
  if (Array.isArray(field)) {
    // names: [String]
    return 'Array';
  } else if (typeof field === 'function') {
    // Coerce both global constructors and mongoose.Schema.Types.
    // name: String
    // name: mongoose.Schema.Types.String
    return field.schemaName || field.name;
  } else if (typeof field === 'object') {
    if (!field.type || typeof field.type === 'object') {
      // Nested mixed type field
      // profile: { name: String } (no type field)
      // type: { type: 'String' } (may be nested)
      return 'Mixed';
    } else {
      // name: { type: String }
      // name: { type: 'String' }
      return getFieldType(field.type);
    }
  } else if (typeof field === 'string') {
    // name: 'String'
    return field;
  } else {
    throw new Error(`Could not derive type for field ${field}.`);
  }
}

function joiSchemaToMongooseValidator(schema, required) {
  // TODO: for now we allow both empty strings and null
  // as a potential signal for "set but non-existent".
  // Is this ok? Do we not want any falsy fields in the
  // db whatsoever?

  schema = required ? schema.required() : schema.allow('', null);

  return (val) => {
    const { error } = schema.validate(val);
    if (error) {
      throw error;
    }
    return true;
  };
}

module.exports = {
  getJoiSchema,
  getMongooseValidator,
};
