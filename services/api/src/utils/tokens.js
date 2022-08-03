const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('@bedrockio/config');

const expiresIn = {
  temporary: '1d',
  regular: '30d',
  invite: '1d',
};

const secrets = {
  user: config.get('JWT_SECRET'),
};

function createTemporaryToken(claims) {
  return jwt.sign(
    {
      ...claims,
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: expiresIn.temporary,
    }
  );
}

function createAuthToken(sub, jti, setExpiresIn) {
  return jwt.sign(
    {
      sub,
      jti,
      type: 'user',
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: setExpiresIn || expiresIn.regular,
    }
  );
}

function generateTokenId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  createTemporaryToken,
  createAuthToken,
  generateTokenId,
};
