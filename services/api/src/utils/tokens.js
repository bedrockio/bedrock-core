const ms = require('ms');
const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const { nanoid } = require('nanoid');

const JWT_SECRET = config.get('JWT_SECRET');

const DURATIONS = {
  invite: '30d',
  regular: '30d',
  temporary: '1h',
  mail: '30d',
};

// Long enough for a browser to load the file it was minted for, short enough
// that a URL leaking through history, a referrer, or a proxy log is stale.
const UPLOAD_TOKEN_DURATION = '5m';

function createAuthToken(ctx, user, options = {}) {
  // Auth tokens are typically created for oneself except
  // in cases where admin are impersonating other users.
  const { type = 'regular', authUser = user } = options;

  const ip = ctx.get('x-forwarded-for') || ctx.ip;
  const country = ctx.get('cf-ipcountry')?.toUpperCase();
  const userAgent = ctx.get('user-agent');

  const payload = getAuthPayload(user);
  const duration = DURATIONS[type];
  const { jti } = payload;

  authUser.authTokens = [
    // filter out any tokens that might have the same jti, very unlikely but possible
    ...authUser.authTokens.filter((existing) => existing.jti !== jti),
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
    duration,
  );
}

function createAccessToken(user, options) {
  const { duration, ...claims } = options;
  return signToken(
    {
      kid: 'access',
      sub: user.id,
      jti: generateTokenId(),
      ...claims,
    },
    duration,
  );
}

// Grants read access to a single private upload for a short window, so an
// <img>/<audio> tag can fetch it without sending an Authorization header.
// Deliberately carries no `sub`: the permission check happens before the URL is
// minted (see validateAccess), and access is granted on the upload id alone, so
// naming a user would give the token no authority it needs — and would make a
// leaked URL usable as that user's credential. Its own `kid` keeps it that way:
// validateToken rejects any token whose kid doesn't match what the route asks
// for, and no route authenticates with type 'upload'.
function createUploadToken(upload) {
  return signToken(
    {
      kid: 'upload',
      jti: generateTokenId(),
      upload: upload.id,
    },
    UPLOAD_TOKEN_DURATION,
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

function getAuthPayload(user) {
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
  generateTokenId,
  createAuthToken,
  removeAuthToken,
  getAuthPayload,
  createInviteToken,
  createUploadToken,
  createPasskeyToken,
  removeExpiredTokens,
  createImpersonateAuthToken,
  createAccessToken,
  signToken,
};
