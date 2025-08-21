const jwt = require('jsonwebtoken');

const { verifyToken } = require('../auth/tokens');

class TokenError extends Error {
  type = 'token';
  status = 401;
}

function validateToken(options = {}) {
  return async (ctx, next) => {
    if (ctx.state.jwt) {
      return next();
    }

    const { type = 'user', optional } = options;

    // ignoring signature for the moment
    const token = getToken(ctx, options);

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

    if (decoded === null) {
      throw new TokenError('bad jwt token');
    }

    const { payload } = decoded;

    if (type !== 'any' && payload.kid !== type) {
      throw new TokenError(`Token type "${payload.kid}" does not match "${type}".`);
    }

    // confirming signature
    try {
      verifyToken(token);
      ctx.state.jwt = payload;
      return next();
    } catch (e) {
      throw new TokenError(e.message);
    }
  };
}

function getToken(ctx, options) {
  const { type } = options;
  if (type === 'any') {
    return getHeaderToken(ctx) || getParamsToken(ctx);
  } else if (type === 'mail') {
    return getParamsToken(ctx);
  } else {
    return getHeaderToken(ctx);
  }
}

function getHeaderToken(ctx) {
  let token;
  const parts = (ctx.request.get('authorization') || '').split(' ');
  if (parts.length === 2) {
    const [scheme, credentials] = parts;
    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  }
  return token;
}

function getParamsToken(ctx) {
  return ctx.request.query?.token || ctx.request.body?.token;
}

module.exports = {
  validateToken,
};
