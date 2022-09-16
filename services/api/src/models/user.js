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

schema.methods.addAuthToken = function ({ exp, jti, iat }, ctx) {
  // filter out any expired tokens + prevent that we are not adding a duplicate
  const authTokens = (this.authTokens || []).filter((token) => token.jti !== jti && token.exp > Date.now());

  this.authTokens = [
    ...authTokens,
    {
      exp: new Date(exp * 1000),
      jti,
      iat: new Date(iat * 1000),
      ip: ctx.get('x-forwarded-for') || ctx.ip,
      userAgent: ctx.get('user-agent'),
    },
  ];
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
