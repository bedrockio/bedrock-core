const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/categories', () => {
  describe('POST /search', () => {
    it('it should list out categories', async () => {
      const user = await createUser({
        roles: ['admin']
      });

      const response = await request('POST', '/1/categories/search', {}, { user });
      expect(response.status).toBe(200);
    });
  });
});
