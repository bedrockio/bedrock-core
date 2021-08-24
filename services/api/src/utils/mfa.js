const notp = require('notp');
const crypto = require('crypto');
const b32 = require('thirty-two');

const config = require('@bedrockio/config');
const APP_NAME = config.get('APP_NAME');

async function requireChallenge(ctx, user) {
  // TODO at late stage check the ctx for device change / ip change / blacklisted ip

  if (user.mfaMethod) return true;
  return false;
}

function generateSecret(options) {
  const config = {
    name: encodeURIComponent(options?.name ?? 'App').toLocaleLowerCase(),
    account: encodeURIComponent(options?.account ? `:${options.account}` : '').toLocaleLowerCase(),
  };

  const bin = crypto.randomBytes(20);
  const base32 = b32.encode(bin).toString('utf8').replace(/=/g, '');

  const secret = base32
    .toLowerCase()
    .replace(/(\w{4})/g, '$1 ')
    .trim()
    .split(' ')
    .join('')
    .toUpperCase();

  const query = `?secret=${secret}&issuer=${config.name}`;
  const uri = `otpauth://totp/${config.name}${config.account}`;

  return {
    secret,
    uri: `${uri}${query}`,
  };
}

function generateToken(secret) {
  if (!secret || !secret.length) return null;
  const unformatted = secret.replace(/\W+/g, '').toUpperCase();
  const bin = b32.decode(unformatted);

  return notp.totp.gen(bin);
}

function verifyToken(secret, method, token) {
  if (!token || !token.length) return null;

  const unformatted = secret.toUpperCase();
  const bin = b32.decode(unformatted);

  const result = notp.totp.verify(token, bin, {
    window: method === 'sms' ? 2 : 1,
    time: 30,
  });

  return result;
}

module.exports = {
  requireChallenge,
  verifyToken,
  generateSecret,
  generateToken,
};
