import jwt from 'jsonwebtoken';
import * as config from '@bedrockio/config';

const expiresIn = {
  temporary: '1d',
  regular: '30d',
  invite: '1d',
};

const secrets = {
  user: config.get('JWT_SECRET'),
};

const createUserTemporaryToken = (claims, type) => {
  return jwt.sign(
    {
      ...claims,
      type,
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: expiresIn.temporary,
    }
  );
};

export { createUserTemporaryToken };

const createUserToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      type: 'user',
      kid: 'user',
    },
    secrets.user,
    {
      expiresIn: expiresIn.regular,
    }
  );
};

export { createUserToken };
