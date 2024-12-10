const { OAuth2Client } = require('google-auth-library');
const { clearAuthenticators } = require('../../../utils/auth/authenticators');

const client = new OAuth2Client();

const { GOOGLE_CLIENT_ID } = process.env;

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    throw new Error('Email not verified.');
  }
  return {
    email: payload.email,
    firstName: payload.given_name,
    lastName: payload.family_name,
  };
}

function addGoogleAuthenticator(user) {
  clearAuthenticators(user, 'google');
  user.authenticators.push({
    type: 'google',
    verifiedAt: new Date(),
  });
}

function removeGoogleAuthenticator(user) {
  clearAuthenticators(user, 'google');
}

module.exports = {
  verifyToken,
  addGoogleAuthenticator,
  removeGoogleAuthenticator,
};
