const { AuditEntry } = require('../../models');
const { createAuthToken } = require('./tokens');
const { sendMessage } = require('../messaging');

async function register(ctx, user) {
  const token = createAuthToken(ctx, user);
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
