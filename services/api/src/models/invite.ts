import mongoose from 'mongoose';
import { createSchema } from '../lib/utils/schema';

const schema = createSchema({
  email: { type: String, trim: true, lowercase: true, required: true },
  status: { type: String },
});

export default mongoose.models.Invite || mongoose.model('Invite', schema);
