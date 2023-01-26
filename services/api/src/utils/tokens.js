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

function createTemporaryToken(claims) {
  return jwt.sign(
    {
      ...claims,
      kid: 'user',
      exp: Math.floor(Date.now() / 1000) + expiresIn.temporary,
    },
    secrets.user
  );
}

function createAuthToken(fields) {
  const jti = generateTokenId();

  const payload = {
    iat: Math.floor(Date.now() / 1000),
    jti,
    type: 'user',
    kid: 'user',
    exp: Math.floor(Date.now() / 1000) + expiresIn.regular,
    ...fields,
  };

  const token = jwt.sign(payload, secrets.user);

  return {
    token,
    payload,
  };
}

function generateTokenId() {
  // https://zelark.github.io/nano-id-cc/ 15 chars ~ 158 years with 1k/s
  return nanoid(15);
}

module.exports = {
  createTemporaryToken,
  createAuthToken,
  generateTokenId,
};
