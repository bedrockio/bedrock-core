import bcrypt from 'bcryptjs';
import config from '@bedrockio/config';

import { clearAuthenticators, addAuthenticator, assertAuthenticator } from './authenticators.js';

// 5 minutes
const MFA_THRESHOLD = 5 * 60 * 1000;

const BCRYPT_COST = config.has('PASSWORD_BCRYPT_COST') ? config.get('PASSWORD_BCRYPT_COST', 'number') : 12;

async function verifyPassword(user, password) {
  const authenticator = assertAuthenticator(user, 'password');

  if (!authenticator.secret) {
    throw new Error('No password set.');
  }

  const match = await bcrypt.compare(password, authenticator.secret);

  if (!match) {
    throw new Error('Incorrect password.');
  }
  authenticator.lastUsedAt = new Date();

  await user.save();
}

// To allow OTP login, passwords may be changed to optional.
function verifyRecentPassword(user) {
  const authenticator = assertAuthenticator(user, 'password');

  const dt = new Date() - authenticator.lastUsedAt;

  if (dt > MFA_THRESHOLD) {
    throw new Error('Password not verified.');
  }
}

async function setPassword(user, password) {
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  const hash = await bcrypt.hash(password, salt);

  clearAuthenticators(user, 'password');

  addAuthenticator(user, {
    type: 'password',
    secret: hash,
  });
}

export { setPassword, verifyPassword, verifyRecentPassword };
