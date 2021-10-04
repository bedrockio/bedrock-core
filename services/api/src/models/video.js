const mongoose = require('mongoose');
const config = require('@bedrockio/config');
const { createSchema } = require('../utils/schema');
const definition = require('./definitions/video.json');

const GC_TRANSCODER_BUCKET = config.get('GC_TRANSCODER_BUCKET');

const schema = createSchema(definition);

const PUBLIC_BUCKET_BASE = `https://${GC_TRANSCODER_BUCKET}.storage.googleapis.com`;

schema.virtual('baseUrl').get(function () {
  // Note CORS headers will ONLY work with subdomains!
  return `${PUBLIC_BUCKET_BASE}/${this.id}/`;
});

schema.virtual('muxPlaybackId').get(function () {
  return this.muxPlaybackIds[0]?.id;
});

schema.virtual('spriteSheets').get(function () {
  return {
    large: `${PUBLIC_BUCKET_BASE}/${this.id}/large-sprite-sheet0000000000.jpeg`,
    small: `${PUBLIC_BUCKET_BASE}/${this.id}/small-sprite-sheet0000000000.jpeg`,
  };
});

module.exports = mongoose.models.Video || mongoose.model('Video', schema);
