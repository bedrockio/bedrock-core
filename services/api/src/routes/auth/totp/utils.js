const speakeasy = require('speakeasy');
const config = require('@bedrockio/config');

const { clearAuthenticators, getRequiredAuthenticator } = require('../../../utils/auth/authenticators');

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

  user.authenticators.push({
    type: 'totp',
    secret,
    verifiedAt: new Date(),
  });

  user.mfaMethod = 'totp';
}

function revokeTotp(user) {
  clearAuthenticators(user, 'totp');
  if (user.mfaMethod === 'totp') {
    delete user.mfaMethod;
  }
}

function verifyTotp(user, code) {
  const authenticator = getRequiredAuthenticator(user, 'totp');
  verifyCode(authenticator.secret, code);
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
