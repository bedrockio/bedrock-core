// const Joi = require('joi');
const yd = require('yada');

const FIXED_SCHEMAS = {
  email: yd.string().lowercase().email(),
  objectId: yd.string().mongo(),
};

function getJoiSchema(attributes, options = {}) {
  const { appendSchema, allowEmpty } = options;
  let schema = getObjectSchema(attributes, options);
  if (!allowEmpty) {
    schema = schema.custom((val) => {
      if (Object.keys(val) === 0) {
        throw new Error('Object must not be empty');
      }
    });
  }
  if (appendSchema) {
    schema = schema.append(appendSchema);
  }
  return schema;
}

function getMongooseValidator(schemaName, field) {
  //   const validator = (val) => {
  //     Joi.assert(val, schema);
  //     return true;
  //   };
  const schema = getSchemaForField(field);
  const validator = (val) => {
    schema.validate(val);
    return true;
  };
  validator.schemaName = schemaName;
  return validator;
  // console.info('UHOH', schemaName, field);
  // return {};
  // return () => {
  //   console.info('??');
  // };
  // return getFixedSchema(type);
}

// function getMongooseValidator(schemaName, field) {
//   const schema = getSchemaForField(field);
//   const validator = (val) => {
//     Joi.assert(val, schema);
//     return true;
//   };
//   // A named shortcut back to the Joi schema to retrieve it
//   // later when generating validations.
//   validator.schemaName = schemaName;
//   return validator;
// }

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
      return yd.array(getSchemaForField(obj[0], options));
    }
  } else {
    // Object/constructor notation implies array of anything:
    // tags: { type: Array }
    // tags: Array
    return yd.array();
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
      if (yd.isSchema(field)) {
        map[key] = field;
      } else {
        map[key] = getSchemaForField(field, options);
      }
    }
  }
  return yd.object(map);
}

function getSchemaForField(field, options = {}) {
  const type = getFieldType(field);
  if (type === 'Array') {
    // Nested array fields may not skip required
    // validations as they are a new context.
    return getArraySchema(field, {
      ...options,
      skipRequired: false,
    });
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
    if (!field.skipValidation) {
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
      schema = schema.allow(...field.enum);
    }
    if (field.match) {
      schema = schema.pattern(RegExp(field.match));
    }
    if (field.min != null || field.minLength != null) {
      schema = schema.min(field.min ?? field.minLength);
    }
    if (field.max != null || field.maxLength != null) {
      schema = schema.max(field.max ?? field.maxLength);
    }
  }
  if (options.allowRanges) {
    schema = getRangeSchema(schema);
  }
  if (options.allowMultiple) {
    schema = yd.allow(schema, yd.array(schema));
  }
  return schema;
}

function isRequiredField(field, options) {
  return field.required && !field.default && !field.skipValidation && !options.skipRequired;
}

function validateWriteScopes(scopes) {
  return yd.custom((val, { prefs }) => {
    let allowed = false;
    if (scopes === 'all') {
      allowed = true;
    } else if (Array.isArray(scopes)) {
      allowed = scopes.some((scope) => {
        return prefs.scopes?.includes(scope);
      });
    }
    if (!allowed) {
      throw new Error(`Insufficient permissions to write to ???`);
    }
  });
}

function getSchemaForType(type) {
  switch (type) {
    case 'String':
      return yd.string();
    case 'Number':
      return yd.number();
    case 'Boolean':
      return yd.boolean();
    case 'Date':
      return yd.date().iso();
    case 'Mixed':
      return yd.object();
    case 'ObjectId':
      return FIXED_SCHEMAS['objectId'];
    default:
      throw new TypeError(`Unknown schema type ${type}`);
  }
}

function getRangeSchema(schema) {
  if (schema.type === 'number') {
    schema = yd.allow(
      schema,
      yd.object({
        lt: yd.number(),
        gt: yd.number(),
        lte: yd.number(),
        gte: yd.number(),
      })
    );
  } else if (schema.type === 'date') {
    return yd.allow(
      schema,
      yd.object({
        lt: yd.date().iso(),
        gt: yd.date().iso(),
        lte: yd.date().iso(),
        gte: yd.date().iso(),
      })
    );
  }
  return schema;
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
