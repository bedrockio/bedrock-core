const verifyAppleToken = require('verify-apple-id-token').default;

const { clearAuthenticators } = require('../../../utils/auth/authenticators');

const { APPLE_SERVICE_ID } = process.env;

async function verifyToken(token) {
  const payload = await verifyAppleToken({
    idToken: token,
    clientId: APPLE_SERVICE_ID,
  });
  if (!payload.email_verified) {
    throw new Error('Email not verified.');
  }
  return payload;
}

function addAppleAuthenticator(user) {
  clearAuthenticators(user, 'apple');
  user.authenticators.push({
    type: 'apple',
    verifiedAt: new Date(),
  });
}

function removeAppleAuthenticator(user) {
  clearAuthenticators(user, 'apple');
}

module.exports = {
  verifyToken,
  addAppleAuthenticator,
  removeAppleAuthenticator,
};
