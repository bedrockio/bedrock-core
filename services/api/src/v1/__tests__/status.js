const { setupDb, teardownDb, request } = require('../../test-helpers');
const Shop = require('../../models/shop');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});


describe('/1/status', () => {
  describe('GET /', () => {
    it('should return success on /1/status check without authentication', async () => {
      const response = await request('GET', '/1/status', {}, {});
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /mongodb', () => {
    it('should return success is false when there are no shops in mongodb', async () => {
      const response = await request('GET', '/1/status/mongodb', {}, {});
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
    });

    it('should return success is true when there are mongodb venues', async () => {
      const venue1 = await Shop.create({
        name: 'Mom and Pop',
        description: 'F   riendly neighbourhood mom and pop shop.'
      });

      const response = await request('GET', '/1/status/mongodb', {}, {});
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});