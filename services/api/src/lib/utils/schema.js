const mongoose = require('mongoose');
const { omitBy } = require('lodash');
const { ObjectId } = mongoose.Schema.Types;

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
  }
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
    fields = omitBy(fields, (value, key) => {
      return isDisallowedField(this, key) || RESERVED_FIELDS.includes(key);
    })
    for (let [key, value] of Object.entries(fields)) {
      if (!value && isReferenceField(this, key)) {
        value = undefined;
      }
      this[key] = value;
    }
  };
  schema.methods.delete = function() {
    this.deletedAt = new Date();
    return this.save();
  };
  return schema;
};

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

function getField(doc, key) {
  const field = doc.schema.obj[key];
  return Array.isArray(field) ? field[0] : field;
}
