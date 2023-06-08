const jwt = require('jsonwebtoken');

const config = require('@bedrockio/config');
const { nanoid } = require('nanoid');

// All expires are expressed in seconds (jwt spec)
const expiresIn = {
  temporary: 24 * 60 * 60, // 1 day
  regular: 30 * 24 * 60 * 60, // 30 days
};

const secrets = {
  user: config.get('JWT_SECRET'),
};

function createTemporaryToken(payload) {
  return jwt.sign(
    {
      ...payload,
      kid: 'user',
      exp: Math.floor(Date.now() / 1000) + expiresIn.temporary,
    },
    secrets.user
  );
}

function createAuthToken(payload) {
  return jwt.sign(payload, secrets.user);
}

function createAuthTokenPayload(fields) {
  return {
    jti: generateTokenId(),
    iat: Math.floor(Date.now() / 1000),
    type: 'user',
    kid: 'user',
    exp: Math.floor(Date.now() / 1000) + expiresIn.regular,
    ...fields,
  };
}

function createTestToken(user) {
  const payload = createAuthTokenPayload({
    sub: user.id,
    ip: '127.0.0.1',
    userAgent: 'testing library',
  });
  return createAuthToken(payload);
}

function generateTokenId() {
  // https://zelark.github.io/nano-id-cc/ 15 chars ~ 158 years with 1k/s
  return nanoid(15);
}

module.exports = {
  createAuthToken,
  generateTokenId,
  createTemporaryToken,
  createAuthTokenPayload,
  createTestToken,
};
