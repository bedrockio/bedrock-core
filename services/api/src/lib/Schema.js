const mongoose = require('mongoose');

class Schema extends mongoose.Schema {

  constructor(schema, options = {}) {
    super({
      deletedAt: { type: Date },
      ...schema,
    }, {

      // Include timestamps by default.
      timestamps: true,

      // Export "id" getter and omit "__v" as
      // well as private fields.
      toJSON: {
        getters: true,
        versionKey: false,
        transform: (doc, ret) => {
          for (let key of Object.keys(ret)) {
            const field = doc.schema.obj[key];
            // Omit any key with a private prefix "_" or marked
            // "access": "private" in the schema. Note that virtuals are
            // excluded by default so they don't need to be removed.
            if (key[0] === '_' || (field && field.access === 'private')) {
              delete ret[key];
            }
          }
        }
      },
      ...options
    });
    Object.assign(this.methods, {
      delete: this.delete,
    });
  }

  delete() {
    this.deletedAt = new Date();
    return this.save();
  }

}

module.exports = Schema;
