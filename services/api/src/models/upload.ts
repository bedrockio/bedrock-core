import mongoose from 'mongoose';
import { createSchema } from '../lib/utils/schema';

const schema = createSchema({
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  storageType: { type: String, required: true },
  rawUrl: { type: String, required: true },
  hash: { type: String, required: true },
  ownerId: { type: String, required: true },
  thumbnailUrl: { type: String },
});

export default mongoose.models.Upload || mongoose.model('Upload', schema);
