import mongoose from 'mongoose';
import { createSchema } from '../lib/utils/schema';
import bcrypt from 'bcrypt';

const schema = createSchema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  roles: [
    {
      type: String,
    },
  ],
  name: {
    type: String,
    trim: true,
  },
  hashedPassword: {
    type: String,
    access: 'private',
  },
  timeZone: { type: String },
});

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
  // @ts-ignore: TODO fix
  if (this._password) {
    const salt = await bcrypt.genSalt(12);
    // @ts-ignore: TODO fix
    this.hashedPassword = await bcrypt.hash(this._password, salt);
    // @ts-ignore: TODO fix
    delete this._password;
  }
  return next();
});

export default mongoose.models.User || mongoose.model('User', schema);
