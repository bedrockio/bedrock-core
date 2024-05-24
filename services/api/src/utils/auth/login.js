const { AuditEntry } = require('../../models');
const { mapExponential } = require('../math');
const { createAuthToken, removeExpiredTokens } = require('./tokens');

const LOGIN_THROTTLE = {
  // Apply lockout after 5 tries
  triesMin: 5,
  // Scale to max at 10 tries
  triesMax: 12,
  // 1 hour lockout maximum
  timeMax: 60 * 60 * 1000,
};

async function login(user, ctx) {
  const token = createAuthToken(user, ctx);
  removeExpiredTokens(user);
  user.loginAttempts = 0;
  await user.save();

  await AuditEntry.append('Logged In', {
    ctx,
    actor: user,
  });

  return token;
}

async function verifyLoginAttempts(user, ctx) {
  const { triesMin, triesMax, timeMax } = LOGIN_THROTTLE;

  // Fixed random failing test where the Date.now() was a fraction later than new Date, resulting in negative number
  // const dt = new Date() - (user.lastLoginAttemptAt || Date.now());
  const now = new Date();
  const dt = now - (user.lastLoginAttemptAt || now);
  const threshold = mapExponential(user.loginAttempts || 0, triesMin, triesMax, 0, timeMax);

  if (dt >= threshold) {
    user.lastLoginAttemptAt = new Date();
    user.loginAttempts += 1;
  } else {
    await AuditEntry.append('Reached max authentication attempts', {
      ctx,
      actor: user,
      category: 'security',
    });
    throw Error(`Too many attempts. Try again in ${Math.max(1, Math.floor(threshold / (60 * 1000)))} minute(s)`);
  }
}

module.exports = {
  login,
  verifyLoginAttempts,
};
