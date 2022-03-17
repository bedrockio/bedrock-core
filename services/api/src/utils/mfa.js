const notp = require('notp');
const crypto = require('crypto');
const b32 = require('thirty-two');

async function requireChallenge(ctx, user) {
  // TODO at late stage check the ctx for device change / ip change / blacklisted ip

  if (user.mfaMethod) return true;
  return false;
}

function generateSecret() {
  const bin = crypto.randomBytes(20);
  const base32 = b32.encode(bin).toString('utf8').replace(/=/g, '');

  const secret = base32
    .toLowerCase()
    .replace(/(\w{4})/g, '$1 ')
    .trim()
    .split(' ')
    .join('')
    .toUpperCase();

  return secret;
}

function generateToken(secret) {
  if (!secret || !secret.length) return null;
  const unformatted = secret.replace(/\W+/g, '').toUpperCase();
  const bin = b32.decode(unformatted);

  return notp.totp.gen(bin);
}

function verifyToken(secret, method, token) {
  if (!token || !token.length || !secret) return null;

  const unformatted = secret.toUpperCase();
  const bin = b32.decode(unformatted);

  const result = notp.totp.verify(token, bin, {
    window: method === 'sms' ? 2 : 1,
    time: 30,
  });

  return result;
}

function generateBackupCodes(count = 16) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 5)}-${code.slice(5, 10)}`);
  }
  return codes;
}

module.exports = {
  requireChallenge,
  verifyToken,
  generateSecret,
  generateToken,
  generateBackupCodes,
};
