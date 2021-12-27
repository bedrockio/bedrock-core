const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const { startCase, uniq, isEmpty, isPlainObject } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');

const { getJoiSchema, getMongooseValidator } = require('./validation');
const { searchValidation, DEFAULT_SORT, DEFAULT_LIMIT } = require('./search');

const { ObjectId } = mongoose.Types;
const { ObjectId: SchemaObjectId, Date: SchemaDate, Number: SchemaNumber } = mongoose.Schema.Types;

const RESERVED_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'deleted'];

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
      transformField(el, schema, options);
    }
  } else if (isPlainObject(obj)) {
    for (let [key, val] of Object.entries(obj)) {
      // Omit any key with a private prefix "_" or marked
      // with "readScopes" in the schema.
      if (!isAllowedField(schema, key, options)) {
        delete obj[key];
      } else if (schema[key]) {
        transformField(val, resolveField(schema, key), options);
      }
    }
  }
}

function createSchema(definition, options = {}) {
  const schema = new mongoose.Schema(
    attributesToMongoose({
      ...definition.attributes,

      // Although timestamps are being set below, we still need to add
      // them to the schema so that validation can be generated for them,
      // namely in getSearchValidation.
      createdAt: 'Date',
      updatedAt: 'Date',
      deletedAt: 'Date',
      deleted: { type: 'Boolean', default: false },
    }),
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
      stripReserved: true,
    });
  });

  schema.static('getSearchValidation', function getSearchValidation(searchOptions) {
    return getJoiSchemaFromMongoose(schema, {
      allowEmpty: true,
      allowRanges: true,
      skipRequired: true,
      allowMultiple: true,
      unwindArrayFields: true,
      appendSchema: searchValidation(searchOptions),
    });
  });

  schema.static('search', function search(body = {}) {
    const { ids, keyword, skip = 0, limit = DEFAULT_LIMIT, sort = DEFAULT_SORT, ...rest } = body;
    const query = {};

    if (ids?.length) {
      query._id = { $in: ids };
    }

    if (keyword) {
      Object.assign(query, buildKeywordQuery(keyword, definition));
    }

    Object.assign(query, flattenQuery(rest, schema.obj));

    console.log(query);

    const mQuery = this.find(query)
      .sort(sort && { [sort.field]: sort.order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // The following construct is awkward but it allows the mongoose query
    // object to be returned while still ultimately resolving with metadata
    // so that this method can behave like other find methods and importantly
    // allow custom population with the same API.

    const runQuery = mQuery.then.bind(mQuery);

    mQuery.then = async (resolve, reject) => {
      try {
        const [data, total] = await Promise.all([runQuery(), this.countDocuments(query)]);
        resolve({
          data,
          meta: {
            total,
            skip,
            limit,
          },
        });
      } catch (err) {
        reject(err);
      }
    };

    return mQuery;
  });

  schema.method('assign', function assign(fields) {
    unsetReferenceFields(fields, schema.obj);
    this.set(fields);
  });

  schema.static('findByIdOrSlug', function findByIdOrSlug(str) {
    let query;
    // There is a non-zero chance of a slug colliding with an ObjectId but
    // is exceedingly rare (run of exactly 24 [a-f0-9] chars together
    // without a hyphen) so this should be acceptable and greatly simplifies
    // the routes. Also enforce 24 chars as 12 is also techincally valid.
    if (str.length === 24 && ObjectId.isValid(str)) {
      query = { _id: str };
    } else {
      query = { slug: str };
    }
    return this.findOne({
      ...query,
    });
  });

  // Soft delete

  schema.pre(/^find|count|exists/, function (next) {
    const filter = this.getFilter();
    if (filter.deleted === undefined) {
      // Search non-deleted docs by default
      filter.deleted = false;
    }
    return next();
  });

  schema.method('delete', function () {
    this.deletedAt = new Date();
    this.deleted = true;
    return this.save();
  });

  schema.method('restore', function restore() {
    this.deletedAt = undefined;
    this.deleted = false;
    return this.save();
  });

  schema.method('destroy', function destroy() {
    return this.remove();
  });

  schema.static('findDeleted', function findOneDeleted(filter) {
    return this.find({
      ...filter,
      deleted: true,
    });
  });

  schema.static('findOneDeleted', function findOneDeleted(filter) {
    return this.findOne({
      ...filter,
      deleted: true,
    });
  });

  schema.static('findByIdDeleted', function findByIdDeleted(id) {
    return this.findOne({
      _id: id,
      deleted: true,
    });
  });

  schema.static('existsDeleted', function existsDeleted() {
    return this.exists({
      deleted: true,
    });
  });

  schema.static('countDocumentsDeleted', function countDocumentsDeleted(filter) {
    return this.countDocuments({
      ...filter,
      deleted: true,
    });
  });

  schema.static('findWithDeleted', function findOneWithDeleted(filter) {
    return this.find({
      ...filter,
      deleted: { $in: [true, false] },
    });
  });

  schema.static('findOneWithDeleted', function findOneWithDeleted(filter) {
    return this.findOne({
      ...filter,
      deleted: { $in: [true, false] },
    });
  });

  schema.static('findByIdWithDeleted', function findByIdWithDeleted(id) {
    return this.findOne({
      _id: id,
      deleted: { $in: [true, false] },
    });
  });

  schema.static('existsWithDeleted', function existsWithDeleted() {
    return this.exists({
      deleted: { $in: [true, false] },
    });
  });

  schema.static('countDocumentsWithDeleted', function countDocumentsWithDeleted(filter) {
    return this.countDocuments({
      ...filter,
      deleted: { $in: [true, false] },
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
    ...options,
    stripFields: options.stripReserved ? [...RESERVED_FIELDS, ...getters] : [],
    transformField: (key, field) => {
      if (isMongooseSchema(field)) {
        return getJoiSchemaFromMongoose(field, options);
      } else {
        return field;
      }
    },
  });
}

function attributesToMongoose(attributes, path = []) {
  const definition = {};
  const { type } = attributes;

  // Is this a Mongoose descriptor like
  // { type: String, required: true }
  // or nested fields of Mixed type.
  const isSchemaType = !!type && typeof type !== 'object';

  for (let [key, val] of Object.entries(attributes)) {
    const type = typeof val;
    if (isSchemaType) {
      if (key === 'type') {
        val = getMongooseType(val, attributes, path);
      } else if (key === 'match' && type === 'string') {
        // Convert match field to RegExp that cannot be expressed in JSON.
        val = RegExp(val);
      } else if (key === 'validate' && type === 'string') {
        // Allow custom mongoose validation function that derives from the Joi schema.
        val = getMongooseValidator(val, attributes);
      } else if (key === 'autopopulate') {
        val = getAutopopulateOptions(val);
      }
    } else if (key !== 'readScopes') {
      if (Array.isArray(val)) {
        val = val.map((el, i) => {
          return attributesToMongoose(el, [...path, i]);
        });
      } else if (isPlainObject(val)) {
        val = attributesToMongoose(val, [...path, key]);
      } else if (!isMongooseSchema(val)) {
        val = getMongooseType(val, attributes, path);
      }
    }
    definition[key] = val;
  }

  return definition;
}

function isMongooseSchema(obj) {
  return obj instanceof mongoose.Schema;
}

function getAutopopulateOptions(val) {
  if (val === true) {
    val = {
      maxDepth: 1,
    };
  }
  return val;
}

function getMongooseType(arg, attributes, path) {
  // Handle strings or functions.
  const str = arg.name || arg;
  const type = mongoose.Schema.Types[str];
  if (!type) {
    throw new Error(`Type ${str} could not be converted to Mongoose type.`);
  } else if (type === SchemaObjectId && !attributes.ref && !attributes.refPath) {
    throw new Error(`Ref must be passed for ${path.join('.')}`);
  }
  return type;
}

function isReferenceField(schema, key) {
  return resolveFieldSchema(schema, key) === SchemaObjectId;
}

function isDateField(schema, key) {
  return resolveFieldSchema(schema, key) === SchemaDate;
}

function isNumberField(schema, key) {
  return resolveFieldSchema(schema, key) === SchemaNumber;
}

function isAllowedField(schema, key, options) {
  if (key[0] === '_') {
    // Strip internal _id and __v fields
    return false;
  } else if (key === 'deleted') {
    // Strip "deleted" field which defaults
    // to false and should not be exposed.
    return false;
  } else if (!schema[key]) {
    // No schema defined may be virtuals.
    return true;
  }
  const { readScopes = 'all' } = resolveField(schema, key) || {};
  if (readScopes === 'all') {
    return true;
  } else if (Array.isArray(readScopes)) {
    const scopes = resolveScopes(options);
    return readScopes.some((scope) => {
      return scopes.includes(scope);
    });
  } else {
    return false;
  }
}

function resolveScopes(options) {
  const { scope, scopes = [] } = options;
  return scope ? [scope] : scopes;
}

// Note: Resolved field may be an object or a function
// from mongoose.Schema.Types that is resolved from the
// shorthand: field: 'String'.
function resolveField(schema, key) {
  let field = schema?.[key];
  if (Array.isArray(field)) {
    field = field[0];
  }
  if (typeof field?.type === 'object') {
    field = field.type;
  }
  return field;
}

function resolveFieldSchema(schema, key) {
  const field = resolveField(schema, key);
  return field?.type || field;
}

function loadModel(definition, name) {
  if (!definition.attributes) {
    throw new Error(`Invalid model definition for ${name}, need attributes`);
  }
  try {
    const schema = createSchema(definition);
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

// Sets falsy reference fields to undefined to signal
// removal. Passing attributes through this function
// normalizes falsy values so they are not saved to the db.
function unsetReferenceFields(fields, schema = {}) {
  for (let [key, value] of Object.entries(fields)) {
    if (!value && isReferenceField(schema, key)) {
      fields[key] = undefined;
    } else if (value && typeof value === 'object') {
      unsetReferenceFields(value, resolveField(schema, key));
    }
  }
}

// Flattens nested queries to a dot syntax.
// Effectively the inverse of lodash get:
// { foo: { bar: 3 } } -> { 'foo.bar': 3 }
// Will not flatten mongo operator objects.
function flattenQuery(query, schema, root = {}, rootPath = []) {
  for (let [key, value] of Object.entries(query)) {
    if (key.includes('.')) {
      // Custom dot syntax is allowed and is already flattened, so skip.
      continue;
    }
    const path = [...rootPath, key];
    if (isRangeQuery(schema, key, value)) {
      if (!isEmpty(value)) {
        root[path.join('.')] = mapOperatorQuery(value);
      }
    } else if (isNestedQuery(key, value)) {
      flattenQuery(value, resolveField(schema, key), root, path);
    } else if (isRegexQuery(key, value)) {
      root[path.join('.')] = parseRegexQuery(value);
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

function isRangeQuery(schema, key, value) {
  // Range queries only allowed on Date and Number fields.
  if (!isDateField(schema, key) && !isNumberField(schema, key)) {
    return false;
  }
  return typeof value === 'object';
}

function mapOperatorQuery(obj) {
  const query = {};
  for (let [key, val] of Object.entries(obj)) {
    query[`$${key}`] = val;
  }
  return query;
}

function isMongoOperator(str) {
  return str.startsWith('$');
}

// Keyword queries
//
// Mongo supports text indexes, however search operations do not support partial
// word matches except for stemming rules (eg: "taste", "tastes", and "tasteful").
//
// Text indexes are preferred for performance, diacritic handling and more, however
// for smaller collections partial matches can be manually enabled by specifying an
// array of "search" fields on the definition:
//
// {
//   "attributes": {
//     "name": {
//       "type": "String",
//       "required": true,
//       "trim": true
//     },
//   },
//   "search": [
//     "name",
//     "description"
//   ]
// },
//
// Be aware that this may impact performance in which case moving to a text index
// may be preferable, however partial word matches will stop working. Support for
// ngram based text search appears to be coming but has no landing date yet.
//
// References:
// https://stackoverflow.com/questions/44833817/mongodb-full-and-partial-text-search
// https://jira.mongodb.org/browse/SERVER-15090

function buildKeywordQuery(keyword, definition) {
  if (definition.search) {
    return buildRegexQuery(keyword, definition);
  } else {
    return buildTextIndexQuery(keyword);
  }
}

function buildRegexQuery(keyword, definition) {
  const queries = definition.search.map((field) => {
    return {
      [field]: {
        $regex: `${keyword}`,
        $options: 'i',
      },
    };
  });
  if (ObjectId.isValid(keyword)) {
    queries.push({ _id: keyword });
  }
  return { $or: queries };
}

function buildTextIndexQuery(keyword) {
  if (ObjectId.isValid(keyword)) {
    return {
      $or: [{ $text: { $search: keyword } }, { _id: keyword }],
    };
  } else {
    return {
      $text: {
        $search: keyword,
      },
    };
  }
}

// Regex queries

const REGEX_QUERY = /^\/(.+)\/(\w*)$/;

function isRegexQuery(key, value) {
  return REGEX_QUERY.test(value);
}

function parseRegexQuery(str) {
  // Note that using the $options syntax allows for PCRE features
  // that aren't supported in Javascript as compared to RegExp(...):
  // https://docs.mongodb.com/manual/reference/operator/query/regex/#pcre-vs-javascript
  const [, $regex, $options] = str.match(REGEX_QUERY);
  return {
    $regex,
    $options,
  };
}

module.exports = {
  createSchema,
  loadModel,
  loadModelDir,
};
