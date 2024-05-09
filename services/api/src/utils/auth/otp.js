const { customAlphabet } = require('nanoid');

const { clearAuthenticators, getRequiredAuthenticator } = require('./authenticators');

const generateCode = customAlphabet('1234567890', 6);

// Hard coded for testers.
const TESTER_CODE = '111111';

// 1 hour
const EXPIRE = 60 * 60 * 1000;

async function createOtp(user) {
  clearAuthenticators(user, 'otp');

  const code = user.isTester ? TESTER_CODE : generateCode();

  user.authenticators.push({
    type: 'otp',
    code,
    expiresAt: new Date(Date.now() + EXPIRE),
  });

  await user.save();

  return code;
}

function verifyOtp(user, code) {
  const authenticator = getRequiredAuthenticator(user, 'otp');
  if (authenticator.code === code) {
    const dt = authenticator.expiresAt - new Date();
    if (dt <= 0) {
      throw new Error('Code expired.');
    }
    clearAuthenticators(user, 'otp');
  } else {
    throw new Error('Incorrect code.');
  }
}

function getOtp(user) {
  return getRequiredAuthenticator(user, 'otp').code;
}

module.exports = {
  getOtp,
  createOtp,
  verifyOtp,
};
