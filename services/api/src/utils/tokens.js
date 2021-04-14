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

function createUserTemporaryToken(claims, type) {
  return jwt.sign(
    {
      ...claims,
      type,
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: expiresIn.temporary,
    }
  );
}

function createUserToken(user) {
  return jwt.sign(
    {
      userId: user._id,
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
  createUserTemporaryToken,
  createUserToken,
  generateTokenId,
};
