const mongoose = require('mongoose');
const { createSchema } = require('@bedrockio/model');

const { validScopes } = require('../utils/permissions');
const { setPassword } = require('../utils/auth/password');
const definition = require('./definitions/user.json');

definition.attributes.roles[0].scope.enum = validScopes;
const schema = createSchema(definition);

schema.virtual('name').get(function () {
  return [this.firstName, this.lastName].join(' ');
});

schema.virtual('password').set(function (password) {
  this._password = password;
});

schema.method('getScopes', function () {
  return this.roles.map((role) => {
    return role.role;
  });
});

schema.pre('save', async function preSave(next) {
  if (this._password) {
    await setPassword(this, this._password);
    delete this._password;
  }
  return next();
});

module.exports = mongoose.models.User || mongoose.model('User', schema);
