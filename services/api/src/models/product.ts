import mongoose from 'mongoose';
import { createSchema } from '../lib/utils/schema';

const { ObjectId } = mongoose.Schema.Types;

const schema = createSchema({
  name: { type: String, trim: true, required: true },
  description: { type: String, trim: true, required: false },
  isFeatured: { type: Boolean },
  expiresAt: { type: Date },
  priceUsd: { type: Number },
  sellingPoints: [{ type: String }],
  shop: {
    ref: 'Shop',
    type: ObjectId,
    required: true,
    autopopulate: true,
  },
  images: [
    {
      type: ObjectId,
      ref: 'Upload',
      autopopulate: true,
    },
  ],
});

schema.plugin(require('mongoose-autopopulate'));

export default mongoose.models.Product || mongoose.model('Product', schema);
