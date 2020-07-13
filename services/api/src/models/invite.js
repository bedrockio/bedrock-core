const { omit } = require('lodash');
const mongoose = require('mongoose');
const { createSchema } = require('../lib/utils/schema');

const schema = createSchema({
  email: { type: String, trim: true, lowercase: true, required: true },
  status: { type: String },
});

schema.methods.assign = function assign(fields) {
  Object.assign(this, omit(fields, ['createdAt', 'updatedAt', 'deletedAt', 'id']));
};

module.exports = mongoose.models.Invite || mongoose.model('Invite', schema);
