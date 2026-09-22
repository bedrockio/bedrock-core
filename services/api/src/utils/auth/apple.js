import appleIdToken from 'verify-apple-id-token';
import config from '@bedrockio/config';

import { clearAuthenticators, upsertAuthenticator } from './authenticators.js';

const APPLE_SERVICE_ID = config.get('APPLE_SERVICE_ID');

async function verifyToken(token) {
  const payload = await appleIdToken.default({
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

export { verifyToken, upsertAppleAuthenticator, removeAppleAuthenticator };
