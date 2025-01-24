function generateAuthenticationOptions() {
  return {
    rpId: 'rpID',
    challenge: 'challenge',
    allowCredentials: [
      {
        id: 'id',
        type: 'public-key',
        transports: ['hybrid', 'internal'],
      },
    ],
    timeout: 60000,
    userVerification: 'preferred',
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
    challenge: 'challenge',
    rp: {
      name: 'Bedrock',
      id: 'rpID',
    },
    user: {
      id: 'id',
      name: options.userName,
      displayName: options.userName,
    },
    pubKeyCredParams: [
      {
        alg: -8,
        type: 'public-key',
      },
      {
        alg: -7,
        type: 'public-key',
      },
      {
        alg: -257,
        type: 'public-key',
      },
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
    hints: [],
  };
}

function verifyRegistrationResponse(options) {
  const { type } = options.response;
  if (type === 'good') {
    return {
      verified: true,
      registrationInfo: {
        credential: {
          id: 'id',
          type: 'public-key',
          transports: ['hybrid', 'internal'],
        },
        credentialDeviceType: 'credentialDeviceType',
        credentialBackedUp: true,
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
