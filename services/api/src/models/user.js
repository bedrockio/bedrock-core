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
    throw new Error('No password set for user');
  } else if (!(await bcrypt.compare(password, this.hashedPassword))) {
    throw new Error('Incorrect password');
  }
};

schema.methods.verifyLoginAttempts = function verifyLoginAttempts() {
  if (this.lastLoginAttemptAt) {
    const { triesMin, triesMax, timeMax } = LOGIN_THROTTLE;
    const dt = new Date() - this.lastLoginAttemptAt;
    const threshold = mapExponential(this.loginAttempts, triesMin, triesMax, 0, timeMax);
    if (dt < threshold) {
      throw new Error('Too many login attempts');
    }
  }
};

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

module.exports = mongoose.models.User || mongoose.model('User', schema);
