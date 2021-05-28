const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { mapExponential } = require('../utils/math');
const { createSchema } = require('../utils/schema');
const { validScopes } = require('../utils/permissions');
const definition = require('./definitions/user.json');

const LOGIN_THROTTLE = {
  // Apply lockout after 3 tries
  triesMin: 3,
  // Scale to max at 10 tries
  triesMax: 10,
  // 1 hour lockout maximum
  timeMax: 60 * 60 * 1000,
};

definition.attributes.roles[0].scope.enum = validScopes;
const schema = createSchema(definition.attributes);

schema.methods.verifyPassword = async function verifyPassword(password) {
  if (!this.hashedPassword) {
    throw Error('No password set for user');
  }
  return bcrypt.compare(password, this.hashedPassword);
};

schema.methods.verifyLoginAttempts = function verifyLoginAttempts() {
  const { triesMin, triesMax, timeMax } = LOGIN_THROTTLE;
  const dt = new Date() - this.lastLoginAttemptAt || Date.now();
  const threshold = mapExponential(this.loginAttempts, triesMin, triesMax, 0, timeMax);
  return dt >= threshold;
};

schema.virtual('fullName').get(function getFullName() {
  return [this.firstName, this.lastName].join(' ');
});

schema.virtual('password').set(function setPassword(password) {
  this._password = password;
});

schema.pre('save', async function preSave(next) {
  if (this._password) {
    const salt = await bcrypt.genSalt(12);
    this.hashedPassword = await bcrypt.hash(this._password, salt);
    delete this._password;
  }
  return next();
});

schema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
});

module.exports = mongoose.models.User || mongoose.model('User', schema);
