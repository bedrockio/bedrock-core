const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { logger } = require('@bedrockio/instrumentation');
const { startCase, omitBy, escapeRegExp, isPlainObject } = require('lodash');

const { getJoiSchema, getMongooseValidator, getFieldType } = require('./validation');
const { searchValidation } = require('./search');

const { ObjectId } = mongoose.Types;
const { ObjectId: ObjectIdSchemaType } = mongoose.Schema.Types;

const RESERVED_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

const serializeOptions = {
  getters: true,
  versionKey: false,
  transform: (doc, ret, options) => {
    transformField(ret, doc.schema.obj, options);
  },
};

function transformField(obj, schema, options) {
  if (Array.isArray(obj)) {
    for (let el of obj) {
      transformField(el, resolveSchema(schema), options);
    }
  } else if (obj && typeof obj === 'object') {
    for (let [key, val] of Object.entries(obj)) {
      // Omit any key with a private prefix "_" or marked
      // "access": "private" in the schema.
      if (key[0] === '_' || isDisallowedField(schema[key], options.private)) {
        delete obj[key];
      } else if (schema[key]) {
        transformField(val, schema[key], options);
      }
    }
  }
}

function createSchema(attributes = {}, options = {}) {
  const definition = attributesToDefinition(attributes);
  const schema = new mongoose.Schema(
    {
      ...definition,
      deletedAt: { type: Date },
    },
    {
      // Include timestamps by default.
      timestamps: true,

      // Export "id" virtual and omit "__v" as well as private fields.
      toJSON: serializeOptions,
      toObject: serializeOptions,

      ...options,
    }
  );

  schema.static('getCreateValidation', function getCreateValidation(appendSchema) {
    return getJoiSchemaFromMongoose(schema, {
      appendSchema,
    });
  });

  schema.static('getUpdateValidation', function getUpdateValidation(appendSchema) {
    return getJoiSchemaFromMongoose(schema, {
      appendSchema,
      skipRequired: true,
    });
  });

  schema.static('getSearchValidation', function getSearchValidation(searchOptions, appendSchema) {
    return getJoiSchema(attributes, {
      disallowField: (key) => {
        return isDisallowedField(this, key);
      },
      stripFields: RESERVED_FIELDS,
      skipRequired: true,
      skipEmptyCheck: true,
      unwindArrayFields: true,
      appendSchema: {
        ...searchValidation(searchOptions),
        ...appendSchema,
      }
    });
  });

  function getKeywordFields() {
    return Object.keys(attributes)
      .filter((key) => {
        let field = attributes[key];
        // TODO: consolidate with getField later
        field = Array.isArray(field) ? field[0] : field;
        return getFieldType(field) === 'String';
      });
  }

  schema.static('search', async function search(body) {
    const { ids, keyword, startAt, endAt, sort, skip, limit, ...rest } = body;
    const query = {
      deletedAt: {
        $exists: false
      }
    };
    if (ids?.length) {
      query._id = { $in: ids };
    }
    if (keyword) {
      const or = [];
      const keywordFields = getKeywordFields();
      if (keywordFields.length) {
        const reg = RegExp(escapeRegExp(keyword), 'i');
        for (let field of keywordFields) {
          or.push({
            [field]: reg,
          });
        }
      }
      if (ObjectId.isValid(keyword)) {
        or.push({
          _id: keyword,
        });
      }
      if (or.length) {
        query.$or = or;
      }
    }
    if (startAt || endAt) {
      query.createdAt = {};
      if (startAt) {
        query.createdAt.$gte = startAt;
      }
      if (endAt) {
        query.createdAt.$lte = endAt;
      }
    }
    for (let [key, value] of Object.entries(rest)) {
      // TODO: is this logic ok? If searching on `categories: []`
      // does this mean return everything or nothing matching categories?
      if (Array.isArray(value)) {
        if (value.length) {
          query[key] = { $in: value };
        }
      } else {
        Object.assign(query, flattenObject(value, [key]));
      }
    }

    const [data, total] = await Promise.all([
      this
      .find(query)
      .sort(sort && { [sort.field]: sort.order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit),
      this.countDocuments(query)
    ]);

    return {
      data,
      meta: {
        total,
        skip,
        limit,
      },
    };
  });

  schema.methods.assign = function assign(fields) {
    fields = omitBy(fields, (value, key) => {
      return isDisallowedField(this.schema.obj[key]) || RESERVED_FIELDS.includes(key);
    });
    for (let [key, value] of Object.entries(fields)) {
      if (!value && isReferenceField(this.schema.obj[key])) {
        value = undefined;
      }
      this[key] = value;
    }
  };

  schema.methods.delete = function () {
    this.deletedAt = new Date();
    return this.save();
  };

  schema.plugin(autopopulate);
  return schema;
}

function getJoiSchemaFromMongoose(schema, options) {
  const getters = Object.keys(schema.virtuals).filter((key) => {
    return schema.virtuals[key].getters.length > 0;
  });
  return getJoiSchema(schema.obj, {
    stripFields: [...RESERVED_FIELDS, ...getters],
    transformField: (key, field) => {
      if (field instanceof mongoose.Schema) {
        return getJoiSchemaFromMongoose(field, options);
      } else if (!isDisallowedField(field)) {
        return field;
      }
    },
    ...options,
  });
}

function attributesToDefinition(attributes) {
  const definition = {};
  const { type } = attributes;

  // Is this a Mongoose descriptor like
  // { type: String, required: true }
  // or nested fields of Mixed type.
  const isSchemaType = !!type && typeof type !== 'object';

  for (let [key, val] of Object.entries(attributes)) {
    if (isSchemaType) {
      if (key === 'type' && typeof val === 'string') {
        val = getMongooseType(val);
      } else if (key === 'validate' && typeof val === 'string') {
        // Allow custom mongoose validation function that derives from the Joi schema.
        val = getMongooseValidator(val, attributes);
      }
    } else {
      if (Array.isArray(val)) {
        val = val.map(attributesToDefinition);
      } else if (isPlainObject(val)) {
        val = attributesToDefinition(val);
      }
    }
    definition[key] = val;
  }

  if ('access' in attributes && !isSchemaType) {
    // Inside nested objects "access" needs to be explicitly
    // disallowed so that it is not assumed to be a field.
    definition.type = {
      access: null,
    };
  }

  return definition;
}

function getMongooseType(str) {
  const type = mongoose.Schema.Types[str];
  if (!type) {
    throw new Error(`Type ${str} could not be converted to Mongoose type.`);
  }
  return type;
}

function isReferenceField(schema) {
  return resolveSchema(schema)?.type === ObjectIdSchemaType;
}

function isDisallowedField(schema, allowPrivate = false) {
  if (resolveSchema(schema)?.access === 'private') {
    return !allowPrivate;
  }
  return false;
}

function resolveSchema(schema) {
  return Array.isArray(schema) ? schema[0] : schema;
}

function loadModel(definition, name) {
  const { attributes } = definition;
  if (!attributes) {
    throw new Error(`Invalid model definition for ${name}, need attributes`);
  }
  const schema = createSchema(attributes);
  return mongoose.model(name, schema);
}

function loadModelDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const basename = path.basename(file, '.json');
    if (file.match(/\.json$/)) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      try {
        const definition = JSON.parse(data);
        const modelName = definition.modelName || startCase(basename).replace(/\s/g, '');
        if (!mongoose.models[modelName]) {
          loadModel(definition, modelName);
        }
      } catch (error) {
        logger.error(`Could not load model definition: ${filePath}`);
        logger.error(error);
        throw error;
      }
    }
  }
  return mongoose.models;
}

// Util

// Flattens nested objects to a dot syntax.
// Effectively the inverse of lodash get:
// { foo: { bar: 3 } } -> { 'foo.bar': 3 }
function flattenObject(obj, path = []) {
  let result = {};
  if (obj) {
    if (isPlainObject(obj)) {
      for (let [key, value] of Object.entries(obj)) {
        result = {
          ...flattenObject(value, [...path, key]),
        };
      }
    } else {
      result[path.join('.')] = obj;
    }
  }
  return result;
}

module.exports = {
  createSchema,
  loadModel,
  loadModelDir,
};
