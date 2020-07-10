const mongoose = require('mongoose');
const { createSchema } = require('../lib/utils/schema');

const schema = createSchema({
  name: { type: String, trim: true, required: true },
});

module.exports = mongoose.models.Category || mongoose.model('Category', schema);
