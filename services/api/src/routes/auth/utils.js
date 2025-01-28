const { User } = require('../../models');

async function findUser(ctx) {
  const { phone, email } = ctx.request.body;

  let query;
  if (phone) {
    query = { phone };
  } else if (email) {
    query = { email };
  } else {
    if (phone === '') {
      ctx.throw(400, 'Phone is required.');
    } else if (email === '') {
      ctx.throw(400, 'Email is required.');
    } else {
      ctx.throw(400, 'Phone or email is required.');
    }
  }

  return await User.findOne(query);
}

module.exports = {
  findUser,
};
