const SimpleWebAuthn = require('@simplewebauthn/server');
const config = require('@bedrockio/config');

const { getAuthenticators, removeAuthenticator, addAuthenticator } = require('./authenticators');
const { createPasskeyToken, verifyToken } = require('./tokens');
const { User } = require('../../models');

const APP_NAME = config.get('APP_NAME');
const APP_URL = config.get('APP_URL');

// Human-readable app name.
const rpName = APP_NAME;

// A unique identifier for your website.
// For SSO this should be the root domain.
const rpID = getRootDomain();

// The URL at which registrations and authentications should occur
const origin = config.get('APP_URL');

async function generateRegistrationOptions(user) {
  const passkeys = getAuthenticators(user, 'passkey');

  const options = await SimpleWebAuthn.generateRegistrationOptions({
    rpID,
    rpName,
    // It seems that good practice when using passkeys is to have a
    // unique identifier as the userName as they may have different
    // logins under the same name. Amazon and others use email where
    // GitHub uses the username. We are also leaving off userDisplayName
    // here for the same reason. Note also that some obfuscate or hide
    // the userName altogether to prevent being leaked on public devices.
    // This seems like overkill however the passkey enable dialog should
    // probably have a warning to never enable it on a public device.
    userName: user.email || user.username,
    // Prevent users from re-registering existing authenticators
    excludeCredentials: passkeys.map((passkey) => ({
      id: passkey.info.id,
      transports: passkey.info.transports,
    })),
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
  });

  const token = createPasskeyToken({
    challenge: options.challenge,
  });

  return {
    token,
    options,
  };
}

async function registerNewPasskey(user, options) {
  const { token, response } = options;

  const payload = verifyToken(token);

  const { registrationInfo } = await SimpleWebAuthn.verifyRegistrationResponse({
    response,
    expectedChallenge: payload.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

  const name = getPasskeyName(user, options);

  addAuthenticator(user, {
    type: 'passkey',
    name,
    info: {
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
    },
  });

  await user.save();
}

function getPasskeyName(user, options) {
  try {
    const { ctx } = options;
    const name = JSON.parse(ctx.get('sec-ch-ua-platform'));
    if (!name) {
      throw new Error();
    }
    return name;
  } catch {
    const authenticators = getAuthenticators(user, 'passkey');
    const number = authenticators.length + 1;
    return `Passkey ${number}`;
  }
}

async function generateAuthenticationOptions() {
  const options = await SimpleWebAuthn.generateAuthenticationOptions({
    rpID,
    // Note keeping allowCredentials empty here to allow the
    // user to choose from any discoverable credentials they
    // may have. Doing this:
    //
    // 1. Allows "seamless" authentication where they do not
    //    have to provide an email or username.
    // 2. Still allows multiple accounts.
    //
    // https://simplewebauthn.dev/docs/advanced/passkeys#generateauthenticationoptions
    //
    allowCredentials: [],
    userVerification: 'preferred',
  });
  const token = createPasskeyToken({
    challenge: options.challenge,
  });
  return {
    token,
    options,
  };
}

async function authenticatePasskeyResponse(options) {
  const { token, response } = options;

  const id = response?.id;

  if (!id) {
    throw new Error('Invalid response.');
  }

  const payload = verifyToken(token);

  const user = await User.findOne({
    'authenticators.type': 'passkey',
    'authenticators.info.id': id,
  });

  if (!user) {
    throw new Error('No user found for passkey. You may need to remove it.');
  }

  const passkey = user.authenticators.find((authenticator) => {
    return authenticator.info?.id === id;
  });

  const { verified, authenticationInfo } = await SimpleWebAuthn.verifyAuthenticationResponse({
    response,
    expectedChallenge: payload.challenge,
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

  passkey.lastUsedAt = new Date();

  return user;
}

function removePasskey(user, id) {
  removeAuthenticator(user, id);
}

function getRootDomain() {
  const { hostname } = new URL(APP_URL);
  return hostname.split('.').slice(-2).join('.');
}

module.exports = {
  generateRegistrationOptions,
  registerNewPasskey,
  generateAuthenticationOptions,
  authenticatePasskeyResponse,
  removePasskey,
};
