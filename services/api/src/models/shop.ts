import mongoose from 'mongoose';
import { createSchema } from '../lib/utils/schema';
const { ObjectId } = mongoose.Schema.Types;

const schema = createSchema({
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
});

schema.plugin(require('mongoose-autopopulate'));

export default mongoose.models.Shop || mongoose.model('Shop', schema);
