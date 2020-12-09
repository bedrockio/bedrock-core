const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const mongoose = require('mongoose');

const secrets = {
  user: config.get('JWT_SECRET'),
};

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
  if (decoded === null) return ctx.throw(401, 'bad jwt token');
  const { payload } = decoded;
  const keyId = payload.kid;
  if (!['user'].includes(keyId)) {
    ctx.throw(401, 'jwt token does not match supported kid');
  }

  if (type && payload.type !== type) {
    ctx.throw(401, `endpoint requires jwt token payload match type "${type}"`);
  }

  // confirming signature
  try {
    jwt.verify(token, secrets[keyId]); // verify will throw
  } catch (e) {
    ctx.throw(401, e);
  }

  return payload;
}

exports.authenticate = ({ type, optional = false } = {}) => {
  return async (ctx, next) => {
    if (!ctx.state.jwt) {
      const token = getToken(ctx);
      if (token) {
        ctx.state.jwt = validateToken(ctx, token, type);
      } else if (!optional) {
        ctx.throw(401, 'no jwt token found in request');
      }
    }
    return next();
  };
};

exports.fetchUser = async (ctx, next) => {
  if (!ctx.state.authUser && ctx.state.jwt) {
    const { User } = mongoose.models;
    ctx.state.authUser = await User.findById(ctx.state.jwt.userId);
    if (!ctx.state.authUser) ctx.throw(401, 'user associated to token could not not be found');
  }
  await next();
};

exports.checkUserRole = function ({ role }) {
  return (ctx, next) => {
    if (!(ctx.state.authUser.roles || []).includes(role)) {
      return ctx.throw(401, `You don't have the right permission for this endpoint (required role: ${role})`);
    }
    return next();
  };
};
