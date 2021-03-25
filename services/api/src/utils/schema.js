const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { startCase, omitBy } = require('lodash');
const { ObjectId } = mongoose.Schema.Types;
const { getValidatorForDefinition } = require('./validator');

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
      transformField(el, schema[0], options);
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
        return isDisallowedField(this.schema.obj[key]);
      },
    });
  });

  schema.static('getPatchValidator', function getPatchValidator() {
    return getValidatorForDefinition(definition, {
      disallowField: (key) => {
        return isDisallowedField(this.schema.obj[key]);
      },
      stripFields: RESERVED_FIELDS,
      skipRequired: true,
    });
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

  return schema;
}

function isReferenceField(schema) {
  return resolveSchema(schema)?.type === ObjectId;
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
