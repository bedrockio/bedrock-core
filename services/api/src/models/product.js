const { omit } = require('lodash');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: false },
    isFeatured: { type: Boolean },
    expiresAt: { type: Date },
    priceUsd: { type: Number },
    sellingPoints: [{ type: String }],
    shopId: { type: ObjectId, required: true, ref: 'Shop' },
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
    ...omit(this.toObject(), ['_id', '__v', 'images'])
  };
};

module.exports = mongoose.models.Product || mongoose.model('Product', schema);
