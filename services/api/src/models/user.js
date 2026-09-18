import mongoose from 'mongoose';
import { createSchema } from '@bedrockio/model';
import { setPassword } from '../utils/auth/password.js';

import definition from './definitions/user.json' with { type: 'json' };

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

schema.pre('save', async function preSave() {
  if (this._password) {
    await setPassword(this, this._password);
    delete this._password;
  }
});

export default mongoose.models.User || mongoose.model('User', schema);
