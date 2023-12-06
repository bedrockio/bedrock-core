function generateAuthenticationOptions(options) {
  const { allowCredentials } = options;
  const id = allowCredentials[0].id.toString();
  return {
    ...options,
    challenge: `${id}-challenge`,
    allowCredentials: allowCredentials.map((credential) => {
      return {
        ...credential,
        id: credential.id.toString('base64url'),
      };
    }),
    timeout: 60000,
  };
}

function verifyAuthenticationResponse(options) {
  const { type } = options.response;
  if (type === 'good') {
    return {
      verified: true,
      authenticationInfo: {
        newCounter: 0,
      },
    };
  } else {
    throw new Error('Bad authentication response.');
  }
}

function generateRegistrationOptions(options) {
  return {
    challenge: 'register-challenge',
    rp: {
      id: options.rpID,
      name: options.rpName,
    },
    user: {
      id: options.userID,
      name: options.userName,
      displayName: options.userDisplayName,
    },
    pubKeyCredParams: [
      { alg: -8, type: 'public-key' },
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' },
    ],
    timeout: 60000,
    attestation: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      requireResidentKey: false,
    },
    extensions: {
      credProps: true,
    },
  };
}

function verifyRegistrationResponse(options) {
  const { type } = options.response;
  if (type === 'good') {
    return {
      verified: true,
      registrationInfo: {
        counter: 0,
        credentialID: 'credential-id',
        credentialPublicKey: 'credential-public-key',
      },
    };
  } else {
    throw new Error('Bad register response.');
  }
}

module.exports = {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  generateRegistrationOptions,
  verifyRegistrationResponse,
};
