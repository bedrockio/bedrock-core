process.env.ENV_NAME = 'production';

const { request } = require('../../utils/testing');

describe('/1/auth', () => {
  it.only('should not suppress token error messages', async () => {
    const password = 'very new password';
    const response = await request(
      'POST',
      '/1/auth/set-password',
      {
        password,
      },
      {
        headers: {
          Authorization: 'Bearer badtoken',
        },
      }
    );
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        type: 'token',
        message: 'bad jwt token',
        status: 401,
      },
    });
  });
});
