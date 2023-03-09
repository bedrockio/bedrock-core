const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { createSchema } = require('@bedrockio/model');

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

schema.method('getScopes', function () {
  return this.roles.map((role) => {
    return role.role;
  });
});

schema.method('removeAuthToken', function removeAuthToken(jti) {
  this.authInfo = this.authInfo.filter((token) => token.jti !== jti);
});

schema.method('createAuthToken', function ({ ip, userAgent, country }, tokenOption = {}) {
  const { token, payload } = createAuthToken({ sub: this.id, ...tokenOption });

  this.authInfo = [
    {
      exp: new Date(payload.exp * 1000),
      jti: payload.jti,
      iat: new Date(payload.iat * 1000),
      ip,
      country: country?.toUpperCase(),
      userAgent: userAgent,
      lastUsedAt: new Date(),
    },
    // filter out any tokens that might have the same jti, very unlikely but possible
    ...this.authInfo.filter((existing) => existing.jti !== payload.jti),
  ];
  return token;
});

schema.pre('save', async function preSave(next) {
  if (this._password) {
    const salt = await bcrypt.genSalt(12);
    this.hashedPassword = await bcrypt.hash(this._password, salt);
    delete this._password;
  }
  return next();
});

module.exports = mongoose.models.User || mongoose.model('User', schema);
