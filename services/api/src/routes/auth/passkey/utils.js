const SimpleWebAuthn = require('@simplewebauthn/server');
const config = require('@bedrockio/config');

const { clearAuthenticators, getRequiredAuthenticator } = require('../../../utils/auth/authenticators');

const APP_NAME = config.get('APP_NAME');
const APP_URL = config.get('APP_URL');

// Human-readable app name.
const rpName = APP_NAME;

// A unique identifier for your website. Note that
// for SSO this should be the root domain.
const rpID = new URL(APP_URL).hostname;

// The URL at which registrations and authentications should occur
const origin = config.get('APP_URL');

async function generateRegistrationOptions(user) {
  // Only allow a single passkey at a time.
  removePasskey(user);

  const options = await SimpleWebAuthn.generateRegistrationOptions({
    rpID,
    rpName,
    userID: user.id,
    userName: user.email,
    userDisplayName: user.name,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
  });

  user.authenticators.push({
    type: 'passkey',
    secret: options.challenge,
  });

  return options;
}

async function verifyRegistrationResponse(user, response) {
  const passkey = getRequiredAuthenticator(user, 'passkey');
  const { registrationInfo } = await SimpleWebAuthn.verifyRegistrationResponse({
    response,
    expectedChallenge: passkey.secret,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  const { counter, credentialID, credentialPublicKey } = registrationInfo;

  Object.assign(passkey, {
    id: Buffer.from(credentialID).toString('base64url'),
    publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
    counter,
  });
}

async function generateAuthenticationOptions(user) {
  const passkey = getRequiredAuthenticator(user, 'passkey');
  const options = await SimpleWebAuthn.generateAuthenticationOptions({
    allowCredentials: [
      {
        id: Buffer.from(passkey.id, 'base64url'),
        type: 'public-key',
        // Optional
        // transports: authenticator.transports,
      },
    ],
    userVerification: 'preferred',
  });

  passkey.secret = options.challenge;
  return options;
}

async function verifyAuthenticationResponse(user, response) {
  const passkey = getRequiredAuthenticator(user, 'passkey');
  const { verified, authenticationInfo } = await SimpleWebAuthn.verifyAuthenticationResponse({
    response,
    expectedChallenge: passkey.secret,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(passkey.id, 'base64url'),
      credentialPublicKey: Buffer.from(passkey.publicKey, 'base64url'),
      counter: passkey.counter,
    },
  });
  if (!verified) {
    throw new Error('Could not verify authentication response.');
  }
  passkey.counter = authenticationInfo.newCounter;
}

function removePasskey(user) {
  clearAuthenticators(user, 'passkey');
}

module.exports = {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  removePasskey,
};
