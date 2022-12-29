const yd = require('@bedrockio/yada');

const FIXED_SCHEMAS = {
  email: yd.string().lowercase().email(),
  objectId: yd.string().mongo(),
};

const OBJECT_ID_DESCRIPTION = `
A 24 character hexadecimal string representing a Mongo [ObjectId](https://bit.ly/3YPtGlU).
An object with an \`id\` field may also be passed, which will be converted into a string.
`;

const OBJECT_ID_SCHEMA = yd
  .custom(async (val) => {
    const id = String(val.id || val);
    await FIXED_SCHEMAS['objectId'].validate(id);
    return id;
  })
  .tag({
    type: 'ObjectId',
    'x-schema': 'ObjectId',
    description: OBJECT_ID_DESCRIPTION.trim(),
  });

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
      schema = yd.array(getSchemaForField(obj, options)).description(obj.description);
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
    schema = validateWriteScopes(schema, field.writeScopes);
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

  if (options.allowSearch) {
    schema = getSearchSchema(schema, type);
  }

  if (field.description) {
    schema = schema.description(field.description);
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
      return yd.date().iso().tag({
        'x-schema': 'DateTime',
        description: 'A `string` in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.',
      });
    case 'Mixed':
      return yd.object();
    case 'ObjectId':
      return OBJECT_ID_SCHEMA;
    default:
      throw new TypeError(`Unknown schema type ${type}`);
  }
}

function getSearchSchema(schema, type) {
  if (type === 'Number') {
    return yd
      .allow(
        schema,
        yd.array(schema),
        yd
          .object({
            lt: yd.number().description('Select values less than.'),
            gt: yd.number().description('Select values greater than.'),
            lte: yd.number().description('Select values less than or equal.'),
            gte: yd.number().description('Select values greater than or equal.'),
          })
          .tag({
            'x-schema': 'NumberRange',
            description: 'An object representing numbers falling within a range.',
          })
      )
      .description('Allows searching by a value, array of values, or a numeric range.');
  } else if (type === 'Date') {
    return yd
      .allow(
        schema,
        yd.array(schema),
        yd
          .object({
            lt: yd.date().iso().description('Select dates occurring before.'),
            gt: yd.date().iso().description('Select dates occurring after.'),
            lte: yd.date().iso().description('Select dates occurring on or before.'),
            gte: yd.date().iso().description('Select dates occurring on or after.'),
          })
          .tag({
            'x-schema': 'DateRange',
            description: 'An object representing dates falling within a range.',
          })
      )
      .description('Allows searching by a date, array of dates, or a range.');
  } else if (type === 'String' || type === 'ObjectId') {
    return yd.allow(schema, yd.array(schema));
  } else {
    return schema;
  }
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
  OBJECT_ID_SCHEMA,
  PermissionsError,
  getValidationSchema,
  getMongooseValidator,
};
