import mongoose from 'mongoose';
import { omitBy } from 'lodash';

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

const createSchema = (definition, options = {}) => {
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
    Object.assign(this, omitBy(fields, (value, key) => {
      return isDisallowedField(this, key) || RESERVED_FIELDS.includes(key);
    }));
  };
  schema.methods.delete = function() {
    this.deletedAt = new Date();
    return this.save();
  };
  return schema;
};

export { createSchema }

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
