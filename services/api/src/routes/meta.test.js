const { request, createUser } = require('../utils/testing');

const roles = require('../roles.json');

describe('/1/meta', () => {
  describe('GET /', () => {
    it('should get app meta', async () => {
      const user = await createUser();
      const response = await request('GET', '/1/meta', {}, { user });
      expect(response).toHaveStatus(200);
      expect(response.body.data).toEqual({
        roles,
        notifications: [
          {
            email: true,
            label: 'Product Updated',
            name: 'product-updated',
          },
        ],
      });
    });
  });

  it('should throw proper JSON error for 404', async () => {
    const user = await createUser();
    const response = await request('GET', '/1/meta/foo', {}, { user });
    expect(response).toHaveStatus(404);
    expect(response.body.error).toEqual({
      type: 'other',
      status: 404,
      message: 'Not Found',
    });
  });
});
