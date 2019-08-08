const { omit } = require('lodash');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    images: [{ type: ObjectId, ref: 'Upload' }],
    categories: [{ type: ObjectId, ref: 'Categories' }],
    country: { type: String },
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
    ...omit(this.toObject(), ['_id', '__v']),
    images: this.images.map((object) => (object.toObject ? object.toResource() : object))
  };
};

module.exports = mongoose.models.Shop || mongoose.model('Shop', schema);
