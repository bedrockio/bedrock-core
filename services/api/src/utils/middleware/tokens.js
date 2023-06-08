const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');

const secrets = {
  user: config.get('JWT_SECRET'),
};

class TokenError extends Error {
  type = 'token';
  status = 401;
}

function validateToken(options = {}) {
  return async (ctx, next) => {
    if (!ctx.state.jwt) {
      const { type, optional } = options;
      // ignoring signature for the moment
      const token = getToken(ctx);

      if (!token) {
        if (optional) {
          return next();
        } else {
          throw new TokenError('no jwt token found in request');
        }
      }

      const decoded = jwt.decode(token, {
        complete: true,
      });
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
        ctx.state.jwt = payload;
        return next();
      } catch (e) {
        throw new TokenError(e.message);
      }
    }
  };
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

module.exports = {
  validateToken,
};
