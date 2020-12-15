const { createSchema } = require('../utils/schema');
const mongoose = require('mongoose');
const definition = require('./definitions/role.json');
const { validContexts, createDefaultPermissions, validatePermissions } = require('../utils/permissions');

const permissions = createDefaultPermissions();
definition.attributes.context.enum = validContexts;
definition.attributes.permissions = permissions;

const schema = createSchema(definition.attributes);

schema.pre('save', async function preSave(next) {
  validatePermissions(this.context, this.permissions);
  return next();
});

module.exports = mongoose.models.Role || mongoose.model('Role', schema);
