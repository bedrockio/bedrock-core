const { customAlphabet } = require('nanoid');
const { sendMessage } = require('../messaging');

const { clearAuthenticators, addAuthenticator, assertAuthenticator } = require('./authenticators');
const { verifyRecentPassword } = require('./password');

const generateCode = customAlphabet('1234567890', 6);

// Hard coded for testers.
const TESTER_CODE = '111111';

// 1 hour
const EXPIRE = 60 * 60 * 1000;

async function sendOtp(user, options) {
  if (!user) {
    return createChallenge(options);
  }

  const { type, phase, channel } = options;

  const template = `otp-${phase}-${type}`;
  const code = await createOtp(user, options);

  if (user.isTester) {
    return createChallenge({
      ...options,
      code,
    });
  } else {
    await sendMessage({
      user,
      code,
      template,
      channel,
    });
    return createChallenge(options, user);
  }
}

function createChallenge(body, target = body) {
  const { type, channel, code } = body;
  const field = channel === 'sms' ? 'phone' : 'email';

  return {
    type,
    code,
    channel,
    [field]: target[field],
  };
}

async function createOtp(user, options = {}) {
  clearAuthenticators(user, 'otp');

  const code = user.isTester ? TESTER_CODE : generateCode();
  const { isMfa = false } = options;

  addAuthenticator(user, {
    type: 'otp',
    code,
    isMfa,
    expiresAt: new Date(Date.now() + EXPIRE),
  });

  await user.save();

  return code;
}

async function verifyOtp(user, code) {
  const authenticator = assertAuthenticator(user, 'otp');

  if (authenticator.code !== code) {
    throw new Error('Incorrect code.');
  }

  const dt = authenticator.expiresAt - new Date();
  if (dt <= 0) {
    throw new Error('Code expired.');
  }

  if (authenticator.isMfa) {
    await verifyRecentPassword(user);
  }

  clearAuthenticators(user, 'otp');
}

module.exports = {
  sendOtp,
  createOtp,
  verifyOtp,
};
