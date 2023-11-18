class MockClient {
  verifyIdToken(options) {
    const { idToken } = options;

    let payload;
    try {
      payload = JSON.parse(idToken);
      return {
        getPayload() {
          return payload;
        },
      };
    } catch {
      throw new Error('Bad Token');
    }
  }
}

function createToken(payload) {
  payload.givenName ||= 'First Name';
  payload.familyName ||= 'Last Name';
  payload.email_verified ??= true;
  return JSON.stringify(payload);
}

module.exports = {
  OAuth2Client: MockClient,
  createToken,
};
