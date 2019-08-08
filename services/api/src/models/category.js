const { omit } = require('lodash');
const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true }
  },
  {
    timestamps: true
  }
);

schema.methods.toResource = function toResource() {
  return {
    id: this._id,
    ...omit(this.toObject(), ['_id', '__v'])
  };
};

module.exports = mongoose.models.Invite || mongoose.model('Category', schema);
