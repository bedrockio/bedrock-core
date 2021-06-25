const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { startCase, uniq, isPlainObject } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');

const { getJoiSchema, getMongooseValidator } = require('./validation');
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
      // with "readScopes" in the schema.
      if (key[0] === '_' || !isAllowedField(schema[key], options.scopes)) {
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

  schema.static('getSearchValidation', function getSearchValidation(options) {
    return getJoiSchema(attributes, {
      stripFields: RESERVED_FIELDS,
      skipRequired: true,
      skipEmptyCheck: true,
      unwindArrayFields: true,
      appendSchema: {
        ...searchValidation(options),
      },
    });
  });

  schema.static('search', async function search(body) {
    const { ids, keyword, startAt, endAt, sort, skip, limit, ...rest } = body;
    const query = {};
    if (ids?.length) {
      query._id = { $in: ids };
    }
    if (keyword) {
      if (ObjectId.isValid(keyword)) {
        query.$or = [{ $text: { $search: keyword } }, { _id: keyword }];
      } else {
        query.$text = {
          $search: keyword,
        };
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
    Object.assign(query, flattenQuery(rest));
    const [data, total] = await Promise.all([
      this.find(query)
        .sort(sort && { [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.countDocuments(query),
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

  schema.method('assign', function assign(fields) {
    for (let [key, value] of Object.entries(fields)) {
      if (!value && isReferenceField(this.schema.obj[key])) {
        value = undefined;
      }
      this[key] = value;
    }
  });

  // Soft delete

  schema.pre(/^find|count|exists/, function (next) {
    const filter = this.getFilter();
    if (filter.deletedAt === undefined) {
      if ('deletedAt' in filter) {
        delete filter.deletedAt;
      } else {
        filter.deletedAt = { $exists: false };
      }
    }
    return next();
  });

  schema.method('delete', function () {
    this.deletedAt = new Date();
    return this.save();
  });

  schema.method('restore', function restore() {
    this.deletedAt = undefined;
    return this.save();
  });

  schema.method('destroy', function destroy() {
    return this.remove();
  });

  schema.static('findDeleted', function findOneDeleted(filter) {
    return this.find({
      ...filter,
      deletedAt: { $exists: true },
    });
  });

  schema.static('findOneDeleted', function findOneDeleted(filter) {
    return this.findOne({
      ...filter,
      deletedAt: { $exists: true },
    });
  });

  schema.static('findByIdDeleted', function findByIdDeleted(id) {
    return this.findOne({
      _id: id,
      deletedAt: { $exists: true },
    });
  });

  schema.static('existsDeleted', function existsDeleted() {
    return this.exists({
      deletedAt: { $exists: true },
    });
  });

  schema.static('countDocumentsDeleted', function countDocumentsDeleted(filter) {
    return this.countDocuments({
      ...filter,
      deletedAt: { $exists: true },
    });
  });

  schema.static('findWithDeleted', function findOneWithDeleted(filter) {
    return this.find({
      ...filter,
      deletedAt: undefined,
    });
  });

  schema.static('findOneWithDeleted', function findOneWithDeleted(filter) {
    return this.findOne({
      ...filter,
      deletedAt: undefined,
    });
  });

  schema.static('findByIdWithDeleted', function findByIdWithDeleted(id) {
    return this.findOne({
      _id: id,
      deletedAt: undefined,
    });
  });

  schema.static('existsWithDeleted', function existsWithDeleted() {
    return this.exists({
      deletedAt: undefined,
    });
  });

  schema.static('countDocumentsWithDeleted', function countDocumentsWithDeleted(filter) {
    return this.countDocuments({
      ...filter,
      deletedAt: undefined,
    });
  });

  schema.post(/^init|save/, function () {
    if (!this.$locals.original) {
      this.$locals.original = this.toObject({
        depopulate: true,
      });
    }
  });

  schema.pre('save', function () {
    // keeps the directModifiedPaths around after document.save
    this.$locals.pathsModified = uniq([...(this.$locals.pathsModified || []), ...this.directModifiedPaths()]);
    if (!this.$locals.isNew) {
      this.$locals.isNew = this.isNew;
    }
  });

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
      } else {
        return field;
      }
    },
    ...options,
  });
}

function attributesToDefinition(attributes, path = []) {
  const definition = {};
  const { type } = attributes;

  // Is this a Mongoose descriptor like
  // { type: String, required: true }
  // or nested fields of Mixed type.
  const isSchemaType = !!type && typeof type !== 'object';

  for (let [key, val] of Object.entries(attributes)) {
    const type = typeof val;
    if (isSchemaType) {
      if (key === 'type' && type === 'string') {
        val = getMongooseType(val, attributes, path);
      } else if (key === 'validate' && type === 'string') {
        // Allow custom mongoose validation function that derives from the Joi schema.
        val = getMongooseValidator(val, attributes);
      }
    } else if (key !== 'readScopes') {
      if (Array.isArray(val)) {
        val = val.map((el, i) => {
          return attributesToDefinition(el, [...path, i]);
        });
      } else if (isPlainObject(val)) {
        val = attributesToDefinition(val, [...path, key]);
      } else if (type === 'string') {
        val = getMongooseType(val, attributes, path);
      }
    }
    definition[key] = val;
  }

  return definition;
}

function getMongooseType(str, attributes, path) {
  const type = mongoose.Schema.Types[str];
  if (!type) {
    throw new Error(`Type ${str} could not be converted to Mongoose type.`);
  } else if (type === ObjectIdSchemaType && !attributes.ref) {
    throw new Error(`Ref must be passed for ${path.join('.')}`);
  }
  return type;
}

function isReferenceField(schema) {
  return resolveSchema(schema)?.type === ObjectIdSchemaType;
}

function isAllowedField(schema, scopes = []) {
  const { readScopes = 'all' } = resolveSchema(schema) || {};
  if (readScopes === 'all') {
    return true;
  } else if (Array.isArray(readScopes)) {
    return readScopes.some((scope) => {
      return scopes.includes(scope);
    });
  } else {
    return false;
  }
}

function resolveSchema(schema) {
  return Array.isArray(schema) ? schema[0] : schema;
}

function loadModel(definition, name) {
  const { attributes } = definition;
  if (!attributes) {
    throw new Error(`Invalid model definition for ${name}, need attributes`);
  }
  try {
    const schema = createSchema(attributes);
    return mongoose.model(name, schema);
  } catch (err) {
    throw new Error(`${err.message} (loading ${name})`);
  }
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

// Flattens nested queries to a dot syntax.
// Effectively the inverse of lodash get:
// { foo: { bar: 3 } } -> { 'foo.bar': 3 }
// Will not flatten mongo operator objects.
function flattenQuery(query, root = {}, rootPath = []) {
  for (let [key, value] of Object.entries(query)) {
    const path = [...rootPath, key];
    if (isNestedQuery(key, value)) {
      flattenQuery(value, root, path);
    } else if (isArrayQuery(key, value)) {
      root[path.join('.')] = { $in: value };
    } else {
      root[path.join('.')] = value;
    }
  }
  return root;
}

function isNestedQuery(key, value) {
  if (isMongoOperator(key) || !isPlainObject(value)) {
    return false;
  }
  return Object.keys(value).every((key) => {
    return !isMongoOperator(key);
  });
}

function isArrayQuery(key, value) {
  return !isMongoOperator(key) && Array.isArray(value);
}

function isMongoOperator(str) {
  return str.startsWith('$');
}

module.exports = {
  createSchema,
  loadModel,
  loadModelDir,
};
