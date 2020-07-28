const mongoose = require('mongoose');
const { omitBy } = require('lodash');

const RESERVED_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

exports.createSchema = (definition, options = {}) => {
  const schema = new mongoose.Schema(
    {
      deletedAt: { type: Date },
      ...definition,
    },
    {
      // Include timestamps by default.
      timestamps: true,

      // Export "id" getter and omit "__v" as
      // well as private fields.
      toJSON: {
        getters: true,
        versionKey: false,
        transform: (doc, ret) => {
          for (let key of Object.keys(ret)) {
            // Omit any key with a private prefix "_" or marked
            // "access": "private" in the schema. Note that virtuals are
            // excluded by default so they don't need to be removed.
            if (key[0] === '_' || isPrivateField(schema, key)) {
              delete ret[key];
            }
          }
        },
      },
      ...options,
    }
  );
  schema.methods.assign = function assign(fields) {
    Object.assign(this, omitBy(fields, (value, key) => {
      return isPrivateField(schema, key) || RESERVED_FIELDS.includes(key);
    }));
  };
  schema.methods.delete = function() {
    this.deletedAt = new Date();
    return this.save();
  };
  return schema;
};

function isPrivateField(schema, key) {
  let field = schema.obj[key];
  if (Array.isArray(field)) {
    field = field[0];
  }
  return field && field.access === 'private';
}
