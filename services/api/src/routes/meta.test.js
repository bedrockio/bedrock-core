const { request, createUser } = require('../utils/testing');

describe('/1/meta', () => {
  describe('GET /', () => {
    it('should get app meta', async () => {
      const user = await createUser();
      const response = await request('GET', '/1/meta', {}, { user });
      expect(response).toHaveStatus(200);
      expect(response.body.data).toEqual({
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
});
