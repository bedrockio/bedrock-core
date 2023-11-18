const { AuditEntry } = require('../../models');
const { createAuthToken } = require('./tokens');
const { sendMessage } = require('../messaging');

async function register(user, ctx) {
  const token = createAuthToken(user, ctx);
  await user.save();

  await AuditEntry.append('Registered', {
    ctx,
    actor: user,
  });

  await sendMessage({
    user,
    template: 'welcome',
  });

  return token;
}

module.exports = {
  register,
};
