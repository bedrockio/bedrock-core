const yd = require('@bedrockio/yada');
const { User } = require('../../models');

// Identify the account by exactly one of email or phone, so the channel a code
// is sent to is never ambiguous.
function validateIdentity(body) {
  return yd.object(body).custom((val) => {
    if (!val.email === !val.phone) {
      throw new Error('Either email or phone is required.');
    }
  });
}

async function findUser(ctx) {
  const { phone, email } = ctx.request.body;
  return await User.findOne(phone ? { phone } : { email });
}

module.exports = {
  findUser,
  validateIdentity,
};
