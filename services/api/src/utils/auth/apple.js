const verifyAppleToken = require('verify-apple-id-token').default;
const config = require('@bedrockio/config');

const { clearAuthenticators, upsertAuthenticator } = require('./authenticators');

const APPLE_SERVICE_ID = config.get('APPLE_SERVICE_ID');

async function verifyToken(token) {
  const payload = await verifyAppleToken({
    idToken: token,
    clientId: APPLE_SERVICE_ID,
  });
  if (!payload.email_verified) {
    throw new Error('Email not verified.');
  }
  return {
    email: payload.email,
    emailVerified: payload.email_verified,
  };
}

function upsertAppleAuthenticator(user) {
  upsertAuthenticator(user, {
    type: 'apple',
  });
}

function removeAppleAuthenticator(user) {
  clearAuthenticators(user, 'apple');
}

module.exports = {
  verifyToken,
  upsertAppleAuthenticator,
  removeAppleAuthenticator,
};
