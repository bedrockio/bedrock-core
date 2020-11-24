const mongoose = require('mongoose');
const { createSchema } = require('../lib/utils/schema');
const bcrypt = require('bcrypt');
const definition = require('./user.json');

const schema = createSchema(definition.attributes);

schema.methods.isAdmin = function isAdmin() {
  return this.roles.indexOf('admin') !== -1;
};

schema.methods.hasRole = function hasRole(role = 'user') {
  return this.roles.indexOf(role) !== -1;
};

schema.methods.verifyPassword = function verifyPassword(password) {
  if (!this.hashedPassword) return false;
  return bcrypt.compare(password, this.hashedPassword);
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
