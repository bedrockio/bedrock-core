const ms = require('ms');
const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const { nanoid } = require('nanoid');

const JWT_SECRET = config.get('JWT_SECRET');

const DURATIONS = {
  invite: '1d',
  regular: '30d',
  temporary: '1h',
};

function createAuthToken(ctx, user, options = {}) {
  // Auth tokens are typically created for oneself except
  // in cases where admin are impersonating other users.
  const { type = 'regular', authUser = user } = options;

  const ip = ctx.get('x-forwarded-for') || ctx.ip;
  const country = ctx.get('cf-ipcountry')?.toUpperCase();
  const userAgent = ctx.get('user-agent');

  const payload = getAuthTokenPayload(user);
  const duration = DURATIONS[type];
  const { jti } = payload;

  authUser.authTokens = [
    // filter out any tokens that might have the same jti, very unlikely but possible
    ...user.authTokens.filter((existing) => existing.jti !== jti),
    {
      ip,
      jti,
      country,
      userAgent,
      expiresAt: new Date(Date.now() + ms(duration)),
      lastUsedAt: new Date(),
    },
  ];

  return signToken(payload, duration);
}

function createTemporaryAuthToken(ctx, user) {
  return createAuthToken(ctx, user, {
    type: 'temporary',
  });
}

function createImpersonateAuthToken(ctx, user, authUser) {
  return createAuthToken(ctx, user, {
    authUser,
    type: 'temporary',
  });
}

function createInviteToken(invite) {
  const duration = DURATIONS.invite;
  return signToken(
    {
      kid: 'invite',
      sub: invite.email,
      jti: generateTokenId(),
    },
    duration
  );
}

function createPasskeyToken(payload) {
  return signToken({
    kid: 'passkey',
    ...payload,
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function removeAuthToken(user, jti) {
  user.authTokens = user.authTokens.filter((token) => token.jti !== jti);
}

function removeExpiredTokens(user) {
  const now = new Date();
  user.authTokens = user.authTokens.filter((token) => token.expiresAt > now);
}

function signToken(payload, duration) {
  duration ||= DURATIONS.temporary;
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: duration,
  });
}

function getAuthTokenPayload(user) {
  return {
    kid: 'user',
    sub: user.id,
    jti: generateTokenId(),
  };
}

function generateTokenId() {
  // https://zelark.github.io/nano-id-cc/ 15 chars ~ 158 years with 1k/s
  return nanoid(15);
}

module.exports = {
  verifyToken,
  createAuthToken,
  removeAuthToken,
  getAuthTokenPayload,
  createInviteToken,
  createPasskeyToken,
  removeExpiredTokens,
  createTemporaryAuthToken,
  createImpersonateAuthToken,
  signToken,
};
