const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { startCase, omitBy } = require('lodash');
const { ObjectId } = mongoose.Schema.Types;
const { getValidatorForDefinition } = require('./validator');
const { logger } = require('./logging');

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

function createSchema(definition, options = {}) {
  const schema = new mongoose.Schema(
    {
      deletedAt: { type: Date },
      ...definition,
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

  schema.static('getValidator', function getValidator() {
    return getValidatorForDefinition(definition, {
      disallowField: (key) => {
        return isDisallowedField(this, key);
      },
    });
  });

  schema.static('getPatchValidator', function getPatchValidator() {
    return getValidatorForDefinition(definition, {
      disallowField: (key) => {
        return isDisallowedField(this, key);
      },
      stripFields: RESERVED_FIELDS,
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
        logger.error(`Could not load model definition: ${filePath}`);
        logger.error(error);
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
