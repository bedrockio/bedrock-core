const jwt = require('jsonwebtoken');
const config = require('@bedrockio/config');
const mongoose = require('mongoose');

const secrets = {
  user: config.get('JWT_SECRET'),
};

class TokenError extends Error {
  type = 'token';
  status = 401;
}

function getToken(ctx) {
  let token;
  const parts = (ctx.request.get('authorization') || '').split(' ');
  if (parts.length === 2) {
    const [scheme, credentials] = parts;
    if (/^Bearer$/i.test(scheme)) token = credentials;
  }
  return token;
}

function validateToken(ctx, token, type) {
  // ignoring signature for the moment
  const decoded = jwt.decode(token, { complete: true });
  if (decoded === null) throw new TokenError('bad jwt token');
  const { payload } = decoded;
  const keyId = payload.kid;
  if (!['user'].includes(keyId)) {
    throw new TokenError('jwt token does not match supported kid');
  }

  if (type && payload.type !== type) {
    throw new TokenError(`endpoint requires jwt token payload match type "${type}"`);
  }

  // confirming signature
  try {
    jwt.verify(token, secrets[keyId]); // verify will throw
  } catch (e) {
    throw new TokenError(e.message);
  }

  return payload;
}

function authenticate({ type, optional = false } = {}) {
  return async (ctx, next) => {
    if (!ctx.state.jwt) {
      const token = getToken(ctx);
      if (token) {
        ctx.state.jwt = validateToken(ctx, token, type);
      } else if (!optional) {
        throw new TokenError('no jwt token found in request');
      }
    }
    return next();
  };
}

async function fetchUser(ctx, next) {
  if (!ctx.state.authUser && ctx.state.jwt) {
    const { jwt } = ctx.state;
    const { User } = mongoose.models;
    const user = await User.findById(jwt.sub);

    const token = user.authInfo.find((token) => token.jti === jwt.jti);

    if (!user || !token) {
      throw new TokenError('User associated to token could not be found');
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
    if (jwt.impersonatedUser) {
      authUser = await User.findById(jwt.impersonatedUser);
      ctx.state.imposter = user;
      if (!authUser) {
        throw new TokenError('User associated to token could not be found');
      }
    }

    ctx.state.authUser = authUser;
  }
  await next();
}

module.exports = {
  authenticate,
  fetchUser,
};
