const yd = require('@bedrockio/yada');

const FIXED_SCHEMAS = {
  email: yd.string().lowercase().email(),
  phone: yd.string().custom(async (val) => {
    // E.164 format
    if (!val.match(/^\+[1-9]\d{1,14}$/)) {
      throw new Error('Not a valid phone number');
    }
    return val;
  }),
  ObjectId: yd.string().mongo(),
};

class PermissionsError extends Error {}

function getValidationSchema(attributes, options = {}) {
  const { appendSchema } = options;
  let schema = getObjectSchema(attributes, options);
  if (appendSchema) {
    schema = schema.append(appendSchema);
  }
  return schema;
}

// Returns an async function that will error on failure.
//
// Note that mongoose validator functions will not be called
// if the field is optional and not set or unset with undefined.
// If the field is not optional the "required" field will also
// perform valdation so no additional checks are necessary.
//
// Also note that throwing an error inside a validator and passing
// the "message" field result in an identical error message. In this
// case we want the schema error messages to trickle down so using
// the first style here.
//
// https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-validate
//
function getMongooseValidator(field) {
  const schema = getSchemaForField(field);

  const validator = async (val) => {
    await schema.validate(val);
  };
  validator.schemaName = field.validate;

  return validator;
}

function getObjectSchema(obj, options) {
  const { stripUnknown } = options;
  const map = {};
  const { transformField } = options;
  for (let [key, field] of Object.entries(obj)) {
    if (key === 'type' && !field.type) {
      // Ignore "type" field unless it's defining a field
      // named "type":
      // type: { type: String }
      continue;
    } else if (field.skipValidation) {
      // Also skip fields that explicitly flag skipping
      // validation.
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

  let schema = yd.object(map);

  if (stripUnknown) {
    schema = schema.options({
      stripUnknown: true,
    });
  }

  return schema;
}

function getArraySchema(obj, options) {
  if (Array.isArray(obj)) {
    // Array further further specifies array fields:
    // tags: [{ name: String }]

    // "required" is a special field in this case which
    // means that an empty array is not allowed:
    // tags: [{
    //   name: String,
    //   requried: true
    //  }]
    obj = obj[0];

    let schema;
    if (options.unwindArrayFields) {
      // Allow array "unwinding". This is used for search validation:
      // { tag: 'one' }
      schema = getSchemaForField(obj, options);
    } else {
      schema = yd.array(getSchemaForField(obj, options));
    }
    if (obj.required) {
      schema = schema.min(1);
    }
    return schema;
  } else {
    // Object/constructor notation implies array of anything:
    // tags: { type: Array }
    // tags: Array
    return yd.array();
  }
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
    // if (!field.skipValidation) {
    schema = validateWriteScopes(schema, field.writeScopes);
    // }
    // } else {
    //   // TODO: for now we allow both empty strings and null
    //   // as a potential signal for "set but non-existent".
    //   // Is this ok? Do we not want any falsy fields in the
    //   // db whatsoever?
    //   schema = schema.allow('', null);
  }
  if (typeof field === 'object') {
    if (field.enum) {
      schema = schema.allow(...field.enum);
    }
    if (field.match) {
      schema = schema.match(RegExp(field.match));
    }
    if (field.min != null || field.minLength != null) {
      schema = schema.min(field.min ?? field.minLength);
    }
    if (field.max != null || field.maxLength != null) {
      schema = schema.max(field.max ?? field.maxLength);
    }
  }
  if (options.allowRanges) {
    schema = getRangeSchema(schema, type);
  }
  if (options.allowMultiple) {
    schema = yd.allow(schema, yd.array(schema));
  }
  return schema;
}

function isRequiredField(field, options) {
  return field.required && !field.default && !field.skipValidation && !options.skipRequired;
}

function validateWriteScopes(schema, allowedScopes) {
  return schema.custom((val, { scopes }) => {
    let allowed = false;
    if (allowedScopes === 'all') {
      allowed = true;
    } else if (Array.isArray(allowedScopes)) {
      allowed = allowedScopes.some((scope) => {
        return scopes?.includes(scope);
      });
    }
    if (!allowed) {
      throw new PermissionsError('requires write permissions');
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
      return yd.custom(async (val) => {
        const id = String(val.id || val);
        await FIXED_SCHEMAS['ObjectId'].validate(id);
        return id;
      });
    default:
      throw new TypeError(`Unknown schema type ${type}`);
  }
}

function getRangeSchema(schema, type) {
  if (type === 'Number') {
    schema = yd.allow(
      schema,
      yd.object({
        lt: yd.number(),
        gt: yd.number(),
        lte: yd.number(),
        gte: yd.number(),
      })
    );
  } else if (type === 'Date') {
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

function getFixedSchema(arg) {
  const name = arg.schemaName || arg;
  const schema = FIXED_SCHEMAS[name];
  if (!schema) {
    throw new Error(`Cannot find schema for ${name}.`);
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
  PermissionsError,
  getValidationSchema,
  getMongooseValidator,
};
