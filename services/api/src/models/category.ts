import mongoose from 'mongoose';
import { createSchema } from '../lib/utils/schema';

const schema = createSchema({
  name: { type: String, trim: true, required: true },
});

export default mongoose.models.Category || mongoose.model('Category', schema);
