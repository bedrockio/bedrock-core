const mongoose = require('mongoose');

const { createSchema } = require('../utils/schema');
const definition = require('./definitions/application-entry.json');

const schema = createSchema(definition);
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.models.ApplicationEntry || mongoose.model('ApplicationEntry', schema);
