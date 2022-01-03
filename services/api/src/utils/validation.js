const Joi = require('joi');

const FIXED_SCHEMAS = {
  email: Joi.string().lowercase().email(),
  objectId: Joi.string().hex().length(24),
};

function getJoiSchema(attributes, options = {}) {
  const { appendSchema, allowEmpty } = options;
  let schema = getObjectSchema(attributes, options);
  if (!allowEmpty) {
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
    Joi.assert(val, schema);
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
      return getSchemaForField(obj[0], options);
    } else {
      return Joi.array().items(getSchemaForField(obj[0], options));
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
    if (key === 'type' && !field.type) {
      // Ignore "type" field unless it's defining a field
      // named "type":
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
  } else if (type === 'Object') {
    return getObjectSchema(field, options);
  }

  let schema;
  if (field.validate) {
    schema = getFixedSchema(field.validate);
  } else {
    schema = getSchemaForType(type, options);
  }

  if (isRequiredField(field, options)) {
    schema = schema.required();
  } else if (field.writeScopes) {
    if (field.skipValidation) {
      schema = Joi.any().strip();
    } else {
      schema = validateWriteScopes(field.writeScopes);
    }
  } else {
    // TODO: for now we allow both empty strings and null
    // as a potential signal for "set but non-existent".
    // Is this ok? Do we not want any falsy fields in the
    // db whatsoever?
    schema = schema.allow('', null);
  }
  if (typeof field === 'object') {
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
    if (options.allowMultiple) {
      schema = Joi.alternatives().try(schema, Joi.array().items(schema));
    }
  }
  return schema;
}

function isRequiredField(field, options) {
  return field.required && !field.default && !field.skipValidation && !options.skipRequired;
}

function validateWriteScopes(scopes) {
  return Joi.custom((val, { prefs }) => {
    let allowed = false;
    if (scopes === 'all') {
      allowed = true;
    } else if (Array.isArray(scopes)) {
      allowed = scopes.some((scope) => {
        return prefs.scopes?.includes(scope);
      });
    }
    if (!allowed) {
      throw new Error();
    }
    return val;
  }).error((errors) => {
    for (let error of errors) {
      const { path } = error;
      error.message = `Insufficient permissions to write to ${path.join('.')}`;
      error.local.permissions = true;
    }
    return errors;
  });
}

function getSchemaForType(type, options) {
  switch (type) {
    case 'String':
      return Joi.string();
    case 'Number':
      if (options.allowRanges) {
        return Joi.alternatives().try(
          Joi.number(),
          Joi.object({
            lt: Joi.number(),
            gt: Joi.number(),
            lte: Joi.number(),
            gte: Joi.number(),
          })
        );
      } else {
        return Joi.number();
      }
    case 'Boolean':
      return Joi.boolean();
    case 'Date':
      if (options.allowRanges) {
        return Joi.alternatives().try(
          Joi.date().iso(),
          Joi.object({
            lt: Joi.date().iso(),
            gt: Joi.date().iso(),
            lte: Joi.date().iso(),
            gte: Joi.date().iso(),
          })
        );
      } else {
        return Joi.date().iso();
      }
    case 'Mixed':
      return Joi.object();
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
      // Nested field
      // profile: { name: String } (no type field)
      // type: { type: 'String' } (may be nested)
      return 'Object';
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

module.exports = {
  getJoiSchema,
  getMongooseValidator,
};
