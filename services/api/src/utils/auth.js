const { mapExponential } = require('../utils/math');
const bcrypt = require('bcrypt');

const LOGIN_THROTTLE = {
  // Apply lockout after 5 tries
  triesMin: 5,
  // Scale to max at 10 tries
  triesMax: 12,
  // 1 hour lockout maximum
  timeMax: 60 * 60 * 1000,
};

async function verifyLoginAttempts(user) {
  const { triesMin, triesMax, timeMax } = LOGIN_THROTTLE;
  const dt = new Date() - (user.lastLoginAttemptAt || Date.now());
  const threshold = mapExponential(user.loginAttempts || 0, triesMin, triesMax, 0, timeMax);

  if (dt >= threshold) {
    user.set({
      lastLoginAttemptAt: new Date(),
      loginAttempts: user.loginAttempts + 1,
    });
    await user.save();
    return;
  }

  throw Error(`Too many attempts. Try again in ${Math.max(1, Math.floor(threshold / (60 * 1000)))} minute(s)`);
}

async function verifyPassword(user, password) {
  if (!user.hashedPassword) {
    throw Error('No password sets');
  }

  if (!(await bcrypt.compare(password, user.hashedPassword))) {
    throw Error('Incorrect password');
  }

  user.loginAttempts = 0;
  await user.save();
}

module.exports = {
  verifyLoginAttempts,
  verifyPassword,
};
