const { validateToken } = require('./tokens');
const { User } = require('../../models');
const compose = require('koa-compose');

function authenticate(options) {
  return compose([
    validateToken({
      ...options,
      type: 'user',
    }),
    authorizeUser(),
  ]);
}

function authorizeUser() {
  return async (ctx, next) => {
    if (!ctx.state.authUser && ctx.state.jwt) {
      const { jwt } = ctx.state;
      const user = await User.findById(jwt.sub);

      const token = user?.authInfo.find((token) => token.jti === jwt.jti);

      if (!user || !token) {
        throw new Error('User associated to token could not be found');
      }

      const ip = ctx.get('x-forwarded-for') || ctx.ip;
      // update update the user if the token hasnt been updated in the last 30 seconds
      // or the ip address has changed
      if (token.lastUsedAt < Date.now() - 1000 * 30 || token.ip !== ip) {
        token.ip = ip;
        token.lastUsedAt = new Date();

        await Promise.all([
          // updates ip + lastUsedAt
          User.updateOne(
            { _id: user.id, 'authInfo._id': token.id },
            {
              $set: {
                'authInfo.$.ip': ip,
                'authInfo.$.lastUsedAt': token.lastUsedAt,
              },
            }
          ),
          // removes expired tokens
          User.updateOne(
            {
              _id: user.id,
            },
            {
              $pull: {
                authInfo: {
                  exp: {
                    $lt: new Date(),
                  },
                },
              },
            }
          ),
        ]);
      }

      let authUser = user;

      if (jwt.authenticateUser) {
        authUser = await User.findById(jwt.authenticateUser);
        if (!authUser) {
          throw new Error('User associated to token could not be found');
        }
      }

      ctx.state.authUser = authUser;
    }
    await next();
  };
}

module.exports = {
  authenticate,
  authorizeUser,
};
