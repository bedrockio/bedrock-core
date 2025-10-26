const { User } = require('../../models');
const { createAuthToken } = require('../tokens');
const { context } = require('../testing');

describe('createAuthToken', () => {
  it('should add an authToken', () => {
    const user = new User({
      firstName: 'Neo',
      lastName: 'One',
      email: 'good@email.com',
    });

    const ctx = context({
      headers: {
        'x-forwarded-for': '122.312.31.2',
        'user-agent': 'test',
      },
    });

    createAuthToken(ctx, user);
    expect(user.authTokens).toMatchObject([
      {
        ip: '122.312.31.2',
        userAgent: 'test',
      },
    ]);
  });

  it('should add second auth token for different user', () => {
    const user = new User({
      firstName: 'Neo',
      lastName: 'One',
      email: 'user@email.com',
    });

    const admin = new User({
      firstName: 'Marlon',
      lastName: 'Brando',
      email: 'admin@email.com',
    });

    const ctx = context({
      headers: {
        'x-forwarded-for': '122.312.31.2',
        'user-agent': 'test',
      },
    });

    admin.authTokens = [createAuthToken(ctx, admin)];

    createAuthToken(ctx, user, {
      authUser: admin,
    });

    expect(admin.authTokens).toMatchObject([
      {
        ip: '122.312.31.2',
        userAgent: 'test',
      },
      {
        ip: '122.312.31.2',
        userAgent: 'test',
      },
    ]);
  });
});
