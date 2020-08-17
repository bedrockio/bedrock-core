const mongoose = require('mongoose');
const { createSchema } = require('../lib/utils/schema');
const { ObjectId } = mongoose.Schema.Types;

const schema = createSchema({
  // --- Generator: schema
  name: { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  images: [
    {
      type: ObjectId,
      ref: 'Upload',
      autopopulate: true,
    },
  ],
  categories: [{ type: ObjectId, ref: 'Categories' }],
  country: { type: String },
  // --- Generator: end
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.models.Shop || mongoose.model('Shop', schema);
