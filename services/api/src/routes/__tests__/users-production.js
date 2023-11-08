process.env.ENV_NAME = 'production';

const { request } = require('../../utils/testing');

describe('/1/users', () => {
  it('should not suppress token error messages', async () => {
    const response = await request(
      'GET',
      '/1/users/me',
      {},
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
