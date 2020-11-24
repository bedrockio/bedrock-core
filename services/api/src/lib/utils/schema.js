const mongoose = require('mongoose');
const { omitBy } = require('lodash');
const fs = require('fs');
const path = require('path');
const { startCase } = require('lodash');

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

exports.createSchema = (definition, options = {}) => {
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
  schema.methods.assign = function assign(fields) {
    Object.assign(
      this,
      omitBy(fields, (value, key) => {
        return isDisallowedField(this, key) || RESERVED_FIELDS.includes(key);
      })
    );
  };
  schema.methods.delete = function () {
    this.deletedAt = new Date();
    return this.save();
  };
  return schema;
};

function isDisallowedField(doc, key, allowPrivate = false) {
  let field = doc.schema.obj[key];
  if (Array.isArray(field)) {
    field = field[0];
  }
  if (field && field.access === 'private') {
    return !allowPrivate;
  }
  return false;
}

exports.loadModel = (definition, name) => {
  const { attributes } = definition;
  if (!attributes) {
    throw new Error(`Invalid model definition for ${name}, need attributes`);
  }
  const schema = exports.createSchema(attributes);
  schema.plugin(require('mongoose-autopopulate'));
  return mongoose.model(name, schema);
};

exports.loadModelDir = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const basename = path.basename(file, '.json');
    const basenameJs = path.basename(file, '.js');
    if (file.match(/\.js$/) && !files.includes(`${basenameJs}.json`)) {
      console.warn(`Found a model ${basenameJs}.js but no corresponding ${basenameJs}.json`);
    }
    if (file.match(/\.js$/)) {
      const modelName = startCase(basenameJs).replace(/\s/g, '');
      if (!mongoose.models[modelName]) {
        const filePath = path.join(dirPath, file);
        require(filePath);
      }
    }
    if (file.match(/\.json$/) && !files.includes(`${basename}.js`)) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      try {
        const definition = JSON.parse(data);
        const modelName = definition.modelName || startCase(basename).replace(/\s/g, '');
        if (!mongoose.models[modelName]) {
          exports.loadModel(definition, modelName);
        }
      } catch (error) {
        console.error(`Could not load model definition: ${filePath}`);
        console.error(error);
      }
    }
  }
  return mongoose.models;
};
