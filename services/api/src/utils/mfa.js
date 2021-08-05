const notp = require('notp');
const crypto = require('crypto');
const b32 = require('thirty-two');
const sms = require('./sms');

const config = require('@bedrockio/config');
const APP_NAME = config.get('APP_NAME');

async function requireChallenge(ctx, user) {
  // TODO at late stage check the ctx for device change / ip change / blacklisted ip

  if (user.mfaMethod) return true;
  return false;
}

function generateSecret(options) {
  const config = {
    name: encodeURIComponent(options?.name ?? 'App'),
    account: encodeURIComponent(options?.account ? `:${options.account}` : ''),
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
  //const encodedQuery = query.replace('?', '%3F').replace('&', '%26');
  const uri = `otpauth://totp/${config.name}${config.account}`;

  return {
    secret,
    uri: `${uri}${query}`,
    //qr: `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${uri}${encodedQuery}`,
  };
}

function generateToken(secret) {
  if (!secret || !secret.length) return null;
  const unformatted = secret.replace(/\W+/g, '').toUpperCase();
  const bin = b32.decode(unformatted);

  return notp.totp.gen(bin);
}

function verifyToken(secret, token, window = 4) {
  if (!token || !token.length) return null;

  const unformatted = secret.replace(/\W+/g, '').toUpperCase();
  const bin = b32.decode(unformatted);

  return notp.totp.verify(token.replace(/\W+/g, ''), bin, {
    window,
    time: 30,
  });
}

async function sendToken(user) {
  if (user.mfaMethod !== 'sms' || !user.mfaSecret || !user.phoneNumber) {
    return false;
  }

  await sms.sendMessage(user.phoneNumber, `Your ${APP_NAME} verification code is: ${generateToken(user.mfaSecret)}`);
  return true;
}

module.exports = {
  requireChallenge,
  sendToken,
  verifyToken,
  generateSecret,
  generateToken,
};
