const mongoose = require('mongoose');

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
            if (key[0] === '_' || isPrivateField(doc, key)) {
              delete ret[key];
            }
          }
        },
      },
      ...options,
    }
  );
  schema.methods.delete = function() {
    this.deletedAt = new Date();
    return this.save();
  };
  return schema;
};

function isPrivateField(doc, key) {
  let field = doc.schema.obj[key];
  if (Array.isArray(field)) {
    field = field[0];
  }
  return field && field.access === 'private';
}
