const { omit } = require('lodash');
const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    storageType: { type: String, required: true },
    rawUrl: { type: String, required: true },
    hash: { type: String, required: true },
    ownerId: { type: String, required: true },
    thumbnailUrl: { type: String },
    deletedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

schema.methods.assign = function assign(fields) {
  Object.assign(this, omit(fields, ['createdAt', 'updatedAt', 'deletedAt', 'id']));
};

schema.methods.delete = function deleteFn() {
  this.deletedAt = new Date();
  return this.save();
};

schema.methods.toResource = function toResource() {
  return {
    id: this._id,
    ...omit(this.toObject(), ['_id', '__v'])
  };
};

module.exports = mongoose.models.Upload || mongoose.model('Upload', schema);
