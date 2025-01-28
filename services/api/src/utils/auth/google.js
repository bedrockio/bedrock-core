const { OAuth2Client } = require('google-auth-library');
const { clearAuthenticators, upsertAuthenticator } = require('./authenticators');
const config = require('@bedrockio/config');

const GOOGLE_CLIENT_ID = config.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = config.get('GOOGLE_CLIENT_SECRET');
const APP_URL = config.get('APP_URL');

const client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: APP_URL,
});

async function verifyToken(code) {
  const { tokens } = await client.getToken(code);
  const { id_token: idToken } = tokens;
  const ticket = await client.verifyIdToken({
    idToken,
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

function upsertGoogleAuthenticator(user) {
  upsertAuthenticator(user, {
    type: 'google',
  });
}

function removeGoogleAuthenticator(user) {
  clearAuthenticators(user, 'google');
}

module.exports = {
  verifyToken,
  upsertGoogleAuthenticator,
  removeGoogleAuthenticator,
};
