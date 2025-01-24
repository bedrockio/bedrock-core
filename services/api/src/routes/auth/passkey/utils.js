const SimpleWebAuthn = require('@simplewebauthn/server');
const config = require('@bedrockio/config');

const { clearAuthenticators, getRequiredAuthenticator } = require('../../../utils/auth/authenticators');

const APP_NAME = config.get('APP_NAME');
const APP_URL = config.get('APP_URL');

// Human-readable app name.
const rpName = APP_NAME;

// A unique identifier for your website.
// For SSO this should be the root domain.
const rpID = getRootDomain(APP_URL);

// The URL at which registrations and authentications should occur
const origin = config.get('APP_URL');

async function generateRegistrationOptions(user) {
  // Only allow a single passkey at a time.
  removePasskey(user);

  const options = await SimpleWebAuthn.generateRegistrationOptions({
    rpID,
    rpName,
    userName: user.name,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
  });

  user.authenticators.push({
    type: 'passkey',
    info: options,
  });

  return options;
}

async function verifyRegistrationResponse(user, response) {
  const passkey = getRequiredAuthenticator(user, 'passkey');

  const { registrationInfo } = await SimpleWebAuthn.verifyRegistrationResponse({
    response,
    expectedChallenge: passkey.info.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

  passkey.info = {
    ...passkey.info,
    // A unique identifier for the credential
    id: credential.id,
    // The public key bytes, used for subsequent authentication signature verification
    publicKey: credential.publicKey,
    // The number of times the authenticator has been used on this site so far
    counter: credential.counter,
    // How the browser can talk with this credential's authenticator
    transports: credential.transports,
    // Whether the passkey is single-device or multi-device
    deviceType: credentialDeviceType,
    // Whether the passkey has been backed up in some way
    backedUp: credentialBackedUp,
  };
}

async function generateAuthenticationOptions(user) {
  const passkey = getRequiredAuthenticator(user, 'passkey');
  const options = await SimpleWebAuthn.generateAuthenticationOptions({
    rpID,
    allowCredentials: [
      {
        id: passkey.info.id,
        transports: passkey.info.transports,
      },
    ],
    userVerification: 'preferred',
  });
  passkey.info = {
    ...passkey.info,
    challenge: options.challenge,
  };

  return options;
}

async function verifyAuthenticationResponse(user, response) {
  const passkey = getRequiredAuthenticator(user, 'passkey');
  const { verified, authenticationInfo } = await SimpleWebAuthn.verifyAuthenticationResponse({
    response,
    expectedChallenge: passkey.info.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.info.id,
      counter: passkey.info.counter,
      transports: passkey.info.transports,
      publicKey: new Uint8Array(passkey.info.publicKey.buffer),
    },
  });
  if (!verified) {
    throw new Error('Could not verify authentication response.');
  }

  passkey.info = {
    ...passkey.info,
    counter: authenticationInfo.newCounter,
  };
}

function removePasskey(user) {
  clearAuthenticators(user, 'passkey');
}

function getRootDomain() {
  const { hostname } = new URL(APP_URL);
  return hostname.split('.').slice(-2).join('.');
}

module.exports = {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  removePasskey,
};
