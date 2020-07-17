const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const User = require('../models/user');

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
  if (decoded === null) return ctx.throw(400, 'bad jwt token');
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

exports.authenticate = ({ type } = {}) => {
  return async (ctx, next) => {
    const token = getToken(ctx);
    if (!token) ctx.throw(400, 'no jwt token found in request');

    const payload = validateToken(ctx, token, type);
    ctx.state.jwt = payload;
    return next();
  };
};

exports.fetchUser = async (ctx, next) => {
  ctx.state.authUser = await User.findById(ctx.state.jwt.userId);
  if (!ctx.state.authUser) ctx.throw(400, 'user associated to token could not not be found');
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
