const { omit } = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    roles: [
      {
        type: String
      }
    ],
    name: { type: String, trim: true },
    language: { type: String, default: 'en' },
    hashedPassword: { type: String },
    deletedAt: { type: Date },
    timeZone: { type: String }
  },
  {
    timestamps: true
  }
);

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

schema.methods.assign = function assign(fields) {
  Object.assign(this, omit(fields, ['createdAt', 'updatedAt', 'deletedAt', 'id', 'hashedPassword'], {}));
};

schema.methods.delete = function deleteFn() {
  this.deletedAt = new Date();
  return this.save();
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

schema.methods.toResource = function toResource() {
  return {
    id: this._id,
    ...omit(this.toObject(), ['_id', '__v', 'hashedPassword', '_password'])
  };
};

module.exports = mongoose.models.User || mongoose.model('User', schema);
