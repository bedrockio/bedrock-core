const { validateToken } = require('./tokens');
const { User } = require('../../models');
const compose = require('koa-compose');
const config = require('@bedrockio/config');

const ENV_NAME = config.get('ENV_NAME');

function authenticate(options = {}) {
  const { optional } = options;
  const fn = compose([
    validateToken({
      ...options,
      type: 'user',
    }),
    authorizeUser(),
  ]);
  // Allows docs to see the auth requirement on the middleware
  // layer to generate an OpenApi entry for it.
  fn.authentication = optional ? 'optional' : 'required';
  return fn;
}

function authorizeUser() {
  return async (ctx, next) => {
    if (ctx.state.authUser || !ctx.state.jwt) {
      return next();
    }

    const { jwt } = ctx.state;

    let authUser;

    if (jwt.authenticateUser) {
      authUser = await User.findById(jwt.authenticateUser);
      if (!authUser) {
        return ctx.throw(403, 'User associated to token could not be found');
      }
    } else {
      authUser = await User.findById(jwt.sub);

      if (!authUser) {
        return ctx.throw(403, 'User associated to token could not be found');
      }

      const token = authUser.authInfo.find((token) => token.jti === jwt.jti);

      if (token) {
        const ip = ctx.get('x-forwarded-for') || ctx.ip;
        // update update the user if the token hasnt been updated in the last 30 seconds
        // or the ip address has changed
        if (token.lastUsedAt < Date.now() - 1000 * 30 || token.ip !== ip) {
          token.ip = ip;
          token.lastUsedAt = new Date();

          await Promise.all([
            // updates ip + lastUsedAt
            User.updateOne(
              {
                _id: authUser.id,
                'authInfo._id': token.id,
              },
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
                _id: authUser.id,
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
      } else if (ENV_NAME !== 'test') {
        return ctx.throw(403, 'User associated to token could not be found');
      }
    }

    ctx.state.authUser = authUser;
    return next();
  };
}

module.exports = {
  authenticate,
  authorizeUser,
};
