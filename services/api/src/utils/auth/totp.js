const speakeasy = require('speakeasy');
const config = require('@bedrockio/config');

const { clearAuthenticators, addAuthenticator, assertAuthenticator } = require('./authenticators');
const { verifyRecentPassword } = require('./password');

const APP_NAME = config.get('APP_NAME');

function generateTotp() {
  const secret = createSecret();
  const url = speakeasy.otpauthURL({
    secret,
    label: APP_NAME,
  });

  return {
    url,
    secret,
  };
}

function createSecret() {
  const { base32: secret } = speakeasy.generateSecret({
    length: 20,
  });
  return secret;
}

function enableTotp(user, secret) {
  clearAuthenticators(user, 'totp');

  addAuthenticator(user, {
    type: 'totp',
    secret,
  });

  user.mfaMethod = 'totp';
}

async function revokeTotp(user) {
  clearAuthenticators(user, 'totp');
  if (user.mfaMethod === 'totp') {
    user.mfaMethod = 'none';
  }
  await user.save();
}

async function verifyTotp(user, code) {
  const authenticator = assertAuthenticator(user, 'totp');
  verifyCode(authenticator.secret, code);

  if (authenticator.isMfa) {
    await verifyRecentPassword(user);
  }

  authenticator.lastUsedAt = new Date();
}

function verifyCode(secret, code) {
  const valid = speakeasy.totp.verify({
    secret,
    token: code,
    window: 2,
  });
  if (!valid) {
    throw new Error('Invalid code.');
  }
}

module.exports = {
  verifyTotp,
  enableTotp,
  revokeTotp,
  generateTotp,
  createSecret,
  verifyCode,
};
