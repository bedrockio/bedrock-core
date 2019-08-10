const { omit } = require('lodash');
const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, required: true },
    status: { type: String },
    deletedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

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

module.exports = mongoose.models.Invite || mongoose.model('Invite', schema);
