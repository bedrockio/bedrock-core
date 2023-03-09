const mongoose = require('mongoose');
const { createSchema } = require('@bedrockio/model');

const definition = require('./definitions/application-request.json');

const schema = createSchema(definition);

// expireAfterSeconds removed documents that is older than X
// This is done to make sure the collection remains small + any leak of secrets is only temporary

const A_DAY_IN_SECONDS = 1000 * 60 * 60 * 24;
schema.index({ createdAt: 1 }, { expireAfterSeconds: A_DAY_IN_SECONDS * 30 });

module.exports = mongoose.models.ApplicationRequest || mongoose.model('ApplicationRequest', schema);
