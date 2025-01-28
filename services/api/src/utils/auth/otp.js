const { customAlphabet } = require('nanoid');
const { sendMessage } = require('../messaging');

const { clearAuthenticators, addAuthenticator, assertAuthenticator } = require('./authenticators');

const generateCode = customAlphabet('1234567890', 6);

// Hard coded for testers.
const TESTER_CODE = '111111';

// 1 hour
const EXPIRE = 60 * 60 * 1000;

async function sendOtp(user, body) {
  if (!user) {
    return createChallenge(body);
  }

  const { type, phase, transport } = body;

  const template = `otp-${phase}-${type}`;
  const code = await createOtp(user);

  if (user.isTester) {
    return createChallenge({
      ...body,
      code,
    });
  } else {
    await sendMessage({
      user,
      code,
      template,
      transport,
    });
    return createChallenge(body, user);
  }
}

function createChallenge(body, target = body) {
  const { type, transport, code } = body;
  const field = transport === 'sms' ? 'phone' : 'email';

  return {
    type,
    code,
    transport,
    [field]: target[field],
  };
}

async function createOtp(user) {
  clearAuthenticators(user, 'otp');

  const code = user.isTester ? TESTER_CODE : generateCode();

  addAuthenticator(user, {
    type: 'otp',
    code,
    expiresAt: new Date(Date.now() + EXPIRE),
  });

  await user.save();

  return code;
}

function verifyOtp(user, code) {
  const authenticator = assertAuthenticator(user, 'otp');
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

module.exports = {
  sendOtp,
  createOtp,
  verifyOtp,
};
