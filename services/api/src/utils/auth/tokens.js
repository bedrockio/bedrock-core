const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const { nanoid } = require('nanoid');

const JWT_SECRET = config.get('JWT_SECRET');

// All expires are expressed in seconds (jwt spec)
const expiresIn = {
  invite: 24 * 60 * 60, // 1 day
  regular: 30 * 24 * 60 * 60, // 30 days
  temporary: 60 * 60, // 1 hour
};

function createAuthToken(ctx, user, options = {}) {
  // Auth tokens are typically created for oneself except
  // in cases where admin are impersonating other users.
  const { type = 'regular', authUser = user } = options;

  const ip = ctx.get('x-forwarded-for') || ctx.ip;
  const country = ctx.get('cf-ipcountry')?.toUpperCase();
  const userAgent = ctx.get('user-agent');

  const payload = getAuthTokenPayload(user, type);
  const { jti } = payload;

  authUser.authTokens = [
    // filter out any tokens that might have the same jti, very unlikely but possible
    ...user.authTokens.filter((existing) => existing.jti !== jti),
    {
      ip,
      jti,
      country,
      userAgent,
      expiresAt: new Date(payload.exp * 1000),
      lastUsedAt: new Date(),
    },
  ];

  return signAuthToken(payload, JWT_SECRET);
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

function verifyAuthToken(token) {
  jwt.verify(token, JWT_SECRET);
}

function removeAuthToken(user, jti) {
  user.authTokens = user.authTokens.filter((token) => token.jti !== jti);
}

function removeExpiredTokens(user) {
  const now = new Date();
  user.authTokens = user.authTokens.filter((token) => token.expiresAt > now);
}

function createInviteToken(invite) {
  return signAuthToken({
    kid: 'invite',
    sub: invite.email,
    jti: generateTokenId(),
    exp: Math.floor(Date.now() / 1000) + expiresIn.invite,
  });
}

function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET);
}

function getAuthTokenPayload(user, type) {
  const { regular, temporary } = expiresIn;
  const duration = type === 'regular' ? regular : temporary;
  return {
    kid: 'user',
    sub: user.id,
    jti: generateTokenId(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + duration,
  };
}

function generateTokenId() {
  // https://zelark.github.io/nano-id-cc/ 15 chars ~ 158 years with 1k/s
  return nanoid(15);
}

module.exports = {
  createAuthToken,
  verifyAuthToken,
  removeAuthToken,
  getAuthTokenPayload,
  createInviteToken,
  removeExpiredTokens,
  createTemporaryAuthToken,
  createImpersonateAuthToken,
  signAuthToken,
};
