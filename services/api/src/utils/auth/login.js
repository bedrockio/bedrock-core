const { AuditEntry } = require('../../models');
const { createAuthToken, removeExpiredTokens } = require('../tokens');

const LOGIN_TIMEOUT_RULES = [
  {
    timeout: 0,
    maxAttempts: 5,
  },
  {
    minAttempts: 6,
    maxAttempts: 10,
    timeout: 60 * 1000,
  },
  {
    minAttempts: 11,
    timeout: 60 * 60 * 1000,
  },
];

async function login(ctx, user, options = {}) {
  const { message = 'Logged In' } = options;

  const token = createAuthToken(ctx, user);
  removeExpiredTokens(user);
  user.loginAttempts = 0;
  await user.save();

  await AuditEntry.append(message, {
    ctx,
    actor: user,
  });

  return token;
}

async function verifyLoginAttempts(user, ctx) {
  let { loginAttempts = 0, lastLoginAttemptAt } = user;

  await user.updateOne({
    lastLoginAttemptAt: new Date(),
    $inc: {
      loginAttempts: 1,
    },
  });

  if (!lastLoginAttemptAt) {
    return;
  }

  const rule = LOGIN_TIMEOUT_RULES.find((r) => {
    const { minAttempts = 0, maxAttempts = Infinity } = r;
    return loginAttempts >= minAttempts && loginAttempts <= maxAttempts;
  });

  const dt = new Date() - lastLoginAttemptAt;

  if (dt < rule?.timeout) {
    await AuditEntry.append('Reached max authentication attempts', {
      ctx,
      actor: user,
    });
    throw new Error('Too many login attempts. Please wait a bit and try again.');
  }
}

module.exports = {
  login,
  verifyLoginAttempts,
};
