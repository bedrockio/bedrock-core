const Joi = require('joi');

const FIXED_SCHEMAS = {
  email: Joi.string().lowercase().email(),
  objectId: Joi.string().hex().length(24),
};

function getJoiSchema(attributes, options = {}) {
  const { appendSchema, skipEmptyCheck } = options;
  let schema = getObjectSchema(attributes, options);
  if (!skipEmptyCheck) {
    schema = schema.min(1);
  }
  if (appendSchema) {
    if (Joi.isSchema(appendSchema)) {
      schema = schema.concat(appendSchema);
    } else {
      schema = schema.append(appendSchema);
    }
  }
  return schema;
}

function getMongooseValidator(schemaName, field) {
  const schema = getSchemaForField(field);
  const validator = (val) => {
    const { error } = schema.validate(val);
    if (error) {
      throw error;
    }
    return true;
  };
  // A named shortcut back to the Joi schema to retrieve it
  // later when generating validations.
  validator.schemaName = schemaName;
  return validator;
}

function getFixedSchema(arg) {
  const name = arg.schemaName || arg;
  const schema = FIXED_SCHEMAS[name];
  if (!schema) {
    throw new Error(`Cannot find schema for ${name}.`);
  }
  return schema;
}

function getArraySchema(obj, options) {
  if (Array.isArray(obj)) {
    // Array notation allows further specification
    // of array fields:
    // tags: [{ name: String }]
    if (options.unwindArrayFields) {
      return getSchemaForField(obj[0], options)
    } else {
      return Joi.array().items(
        getSchemaForField(obj[0], options)
      );
    }
  } else {
    // Object/constructor notation implies array of anything:
    // tags: { type: Array }
    // tags: Array
    return Joi.array();
  }
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

function getSchemaForField(field, options = {}) {
  const type = getFieldType(field);
  if (type === 'Array') {
    return getArraySchema(field, options);
  } else if (type === 'Mixed') {
    return getObjectSchema(field, options);
  }

  let schema;
  if (field.validate) {
    schema = getFixedSchema(field.validate);
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
  switch (getCoercedSchemaType(type)) {
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
        Joi.assert(id, FIXED_SCHEMAS['objectId']);
        return id;
      });
    default:
      throw new TypeError(`Unknown schema type ${type}`);
  }
}

function getCoercedSchemaType(type) {
  // Allow both "String" and String.
  if (typeof type === 'function') {
    type = type.name;
  }
  return type;
}

function getFieldType(field) {
  // Normalize different mongoose type definitions. Be careful
  // of nested type definitions.
  if (Array.isArray(field)) {
    // names: [String]
    return 'Array';
  } else if (typeof field === 'object') {
    // TODO: can getCoercedSchemaType be used here too?
    if (typeof field.type === 'function') {
      // name: { type: String }
      return field.type.name;
    } else if (typeof field.type === 'string') {
      // name: { type: 'String' }
      return field.type;
    } else {
      // profile: { name: String } (no type field)
      // type: { type: 'String' } (may be nested)
      return 'Mixed';
    }
  } else {
    // name: String
    // name: 'String'
    return getCoercedSchemaType(field);
  }
}

module.exports = {
  getJoiSchema,
  getCoercedSchemaType,
  getMongooseValidator,
};
