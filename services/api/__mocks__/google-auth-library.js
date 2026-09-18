class MockClient {
  getToken(code) {
    return {
      tokens: {
        id_token: code,
      },
    };
  }
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

function createCode(payload) {
  payload.givenName ||= 'First Name';
  payload.familyName ||= 'Last Name';
  payload.email_verified ??= true;
  return JSON.stringify(payload);
}

export { MockClient as OAuth2Client, createCode };
