const bcrypt = require('bcrypt');

const { getAuthenticator, clearAuthenticators, addAuthenticator, assertAuthenticator } = require('./authenticators');

// 5 minutes
const MFA_THRESHOLD = 5 * 60 * 1000;

async function verifyPassword(user, password) {
  const authenticator = assertAuthenticator(user, 'password');

  const match = await bcrypt.compare(password, authenticator.secret);

  if (!match) {
    throw Error('Incorrect password.');
  }
  authenticator.lastUsedAt = new Date();

  await user.save();
}

// To allow OTP login, passwords may be changed to optional.
function verifyRecentPassword(user) {
  const authenticator = getAuthenticator(user, 'password');

  if (!authenticator) {
    return;
  }

  const dt = new Date() - authenticator.lastUsedAt;
  if (dt > MFA_THRESHOLD) {
    throw new Error('Password not verified.');
  }
}

async function setPassword(user, password) {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  clearAuthenticators(user, 'password');

  addAuthenticator(user, {
    type: 'password',
    secret: hash,
  });
}

module.exports = {
  setPassword,
  verifyPassword,
  verifyRecentPassword,
};
