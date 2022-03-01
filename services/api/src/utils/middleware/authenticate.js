const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const mongoose = require('mongoose');

const secrets = {
  user: config.get('JWT_SECRET'),
};

class TokenError extends Error {
  type = 'token';
  status = 401;
}

function getToken(ctx) {
  let token;
  const parts = (ctx.request.get('authorization') || '').split(' ');
  if (parts.length === 2) {
    const [scheme, credentials] = parts;
    if (/^Bearer$/i.test(scheme)) token = credentials;
  }
  return token;
}

function validateToken(ctx, token, type) {
  // ignoring signature for the moment
  const decoded = jwt.decode(token, { complete: true });
  if (decoded === null) throw new TokenError('bad jwt token');
  const { payload } = decoded;
  const keyId = payload.kid;
  if (!['user'].includes(keyId)) {
    throw new TokenError('jwt token does not match supported kid');
  }

  if (type && payload.type !== type) {
    throw new TokenError(`endpoint requires jwt token payload match type "${type}"`);
  }

  // confirming signature
  try {
    jwt.verify(token, secrets[keyId]); // verify will throw
  } catch (e) {
    throw new TokenError(e.message);
  }

  return payload;
}

function authenticate({ type, optional = false } = {}) {
  return async (ctx, next) => {
    if (!ctx.state.jwt) {
      const token = getToken(ctx);
      if (token) {
        ctx.state.jwt = validateToken(ctx, token, type);
      } else if (!optional) {
        throw new TokenError('no jwt token found in request');
      }
    }
    return next();
  };
}

async function fetchUser(ctx, next) {
  if (!ctx.state.authUser && ctx.state.jwt) {
    const { jwt } = ctx.state;
    const { User } = mongoose.models;
    const user = await User.findById(jwt.sub);
    if (!user || (jwt.jti && jwt.jti !== user.authTokenId)) {
      throw new TokenError('user associated to token could not be found');
    }
    ctx.state.authUser = user;
  }
  await next();
}

module.exports = {
  authenticate,
  fetchUser,
};
