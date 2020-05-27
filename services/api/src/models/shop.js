const mongoose = require('mongoose');
const Schema = require('../utils/Schema');
const { ObjectId } = mongoose.Schema.Types;

const schema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    images: [{
      type: ObjectId,
      ref: 'Upload',
      autopopulate: true
    }],
    categories: [{ type: ObjectId, ref: 'Categories' }],
    country: { type: String }
  }
);

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.models.Shop || mongoose.model('Shop', schema);
