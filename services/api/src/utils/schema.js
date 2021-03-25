const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { startCase, omitBy, isPlainObject } = require('lodash');
const { ObjectId } = mongoose.Schema.Types;
const { getJoiSchemaForAttributes, getMongooseValidator } = require('./validation');

const RESERVED_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

const serializeOptions = {
  getters: true,
  versionKey: false,
  transform: (doc, ret, options) => {
    for (let key of Object.keys(ret)) {
      // Omit any key with a private prefix "_" or marked
      // "access": "private" in the schema. Note that virtuals are
      // excluded by default so they don't need to be removed.
      if (key[0] === '_' || isDisallowedField(doc, key, options.private)) {
        delete ret[key];
      }
    }
  },
};

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
    return getJoiSchemaForAttributes(attributes, {
      disallowField: (key) => {
        return isDisallowedField(this, key);
      },
      appendSchema,
    });
  });

  schema.static('getUpdateValidation', function getUpdateValidation(appendSchema) {
    const getters = Object.keys(schema.virtuals).filter((key) => {
      return schema.virtuals[key].getters.length > 0;
    });
    return getJoiSchemaForAttributes(attributes, {
      disallowField: (key) => {
        return isDisallowedField(this, key);
      },
      appendSchema,
      stripFields: [...RESERVED_FIELDS, ...getters],
      skipRequired: true,
    });
  });

  schema.methods.assign = function assign(fields) {
    fields = omitBy(fields, (value, key) => {
      return isDisallowedField(this, key) || RESERVED_FIELDS.includes(key);
    });
    for (let [key, value] of Object.entries(fields)) {
      if (!value && isReferenceField(this, key)) {
        value = undefined;
      }
      this[key] = value;
    }
  };

  schema.methods.delete = function () {
    this.deletedAt = new Date();
    return this.save();
  };

  return schema;
}

function attributesToDefinition(attributes) {
  const definition = {};
  const { type } = attributes;

  // Is this a Mongoose descriptor like
  // { type: String, required: true }
  // or nested fields of Mixed type.
  const isSchemaType = type && typeof type !== 'object';

  for (let [key, val] of Object.entries(attributes)) {
    if (isSchemaType) {
      if (typeof val === 'string' && key === 'validate') {
        // Map string shortcuts to mongoose validators such as "email".
        val = getMongooseValidator(val);
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
  return definition;
}

function getField(doc, key) {
  const field = doc.schema.obj[key];
  return Array.isArray(field) ? field[0] : field;
}

function isReferenceField(doc, key) {
  const field = getField(doc, key);
  return field.type === ObjectId;
}

function isDisallowedField(doc, key, allowPrivate = false) {
  const field = getField(doc, key);
  if (field && field.access === 'private') {
    return !allowPrivate;
  }
  return false;
}

function loadModel(definition, name) {
  const { attributes } = definition;
  if (!attributes) {
    throw new Error(`Invalid model definition for ${name}, need attributes`);
  }
  const schema = createSchema(attributes);
  schema.plugin(require('mongoose-autopopulate'));
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
        console.error(`Could not load model definition: ${filePath}`);
        console.error(error);
      }
    }
  }
  return mongoose.models;
}

module.exports = {
  createSchema,
  loadModel,
  loadModelDir,
};
