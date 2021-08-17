const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('@bedrockio/config');

const expiresIn = {
  temporary: '1d',
  regular: '30d',
  invite: '1d',
  shortLived: '10m',
};

const secrets = {
  user: config.get('JWT_SECRET'),
};

function createTemporaryToken(claims, { shortLived = false }) {
  return jwt.sign(
    {
      ...claims,
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: shortLived ? expiresIn.shortLived : expiresIn.temporary,
    }
  );
}

function createShortLivedToken(claims) {
  return jwt.sign(
    {
      ...claims,
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: expiresIn.shortlived,
    }
  );
}

function createAuthToken(sub, jti) {
  return jwt.sign(
    {
      sub,
      jti,
      type: 'user',
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: expiresIn.regular,
    }
  );
}

function generateTokenId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  createShortLivedToken,
  createTemporaryToken,
  createAuthToken,
  generateTokenId,
};
