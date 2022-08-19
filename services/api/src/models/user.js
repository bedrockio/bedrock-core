const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { createSchema } = require('../utils/schema');
const { validScopes } = require('../utils/permissions');
const definition = require('./definitions/user.json');

definition.attributes.roles[0].scope.enum = validScopes;
const schema = createSchema(definition);

schema.virtual('name').get(function () {
  return [this.firstName, this.lastName].join(' ');
});

schema.virtual('password').set(function (password) {
  this._password = password;
});

schema.methods.addAuthTokenId = function (authTokenId) {
  this.authTokenIds.push(authTokenId);
  if (this.authTokenIds.length > 10) {
    this.authTokenIds.slice(-10);
  }
};

schema.pre('save', async function preSave(next) {
  if (this._password) {
    const salt = await bcrypt.genSalt(12);
    this.hashedPassword = await bcrypt.hash(this._password, salt);
    delete this._password;
  }
  return next();
});

module.exports = mongoose.models.User || mongoose.model('User', schema);
