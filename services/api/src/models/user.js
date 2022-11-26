const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { createSchema } = require('../utils/schema');
const { validScopes } = require('../utils/permissions');
const { createAuthToken } = require('../utils/tokens');
const definition = require('./definitions/user.json');

definition.attributes.roles[0].scope.enum = validScopes;
const schema = createSchema(definition);

schema.virtual('name').get(function () {
  return [this.firstName, this.lastName].join(' ');
});

schema.virtual('password').set(function (password) {
  this._password = password;
});

schema.methods.removeAuthToken = function (jti) {
  this.authTokens = this.authTokens.filter((token) => token.jti !== jti);
};

schema.methods.addAuthToken = function ({ ip, userAgent }) {
  const { token, payload } = createAuthToken(this.id);

  this.authTokens = [
    {
      exp: new Date(payload.exp * 1000),
      jti: payload.jti,
      iat: new Date(payload.iat * 1000),
      ip,
      userAgent: userAgent,
      lastUsedAt: new Date(),
    },
    // filter out any tokens that might have the same jti, very unlikely but possible
    ...this.authTokens.filter((existing) => existing.jti !== payload.jti),
  ];
  return token;
};

schema.pre('save', async function preSave(next) {
  // filter out expired token references
  this.authTokens = this.authTokens.filter((token) => token.exp > Date.now());

  if (this._password) {
    const salt = await bcrypt.genSalt(12);
    this.hashedPassword = await bcrypt.hash(this._password, salt);
    delete this._password;
  }
  return next();
});

module.exports = mongoose.models.User || mongoose.model('User', schema);
