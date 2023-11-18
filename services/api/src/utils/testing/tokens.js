const jwt = require('jsonwebtoken');

function assertAuthToken(user, token) {
  const { payload } = jwt.decode(token, {
    complete: true,
  });
  expect(payload).toMatchObject({
    kid: 'user',
    sub: user.id,
  });
}

module.exports = {
  assertAuthToken,
};
