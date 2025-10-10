const { request, createUser } = require('../utils/testing');

describe('/1/status', () => {
  describe('GET /', () => {
    it('should return success on /1/status check without authentication', async () => {
      const response = await request('GET', '/1/status', {}, {});
      expect(response).toHaveStatus(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /mongodb', () => {
    it('should return success is false when there are no users in mongodb', async () => {
      const response = await request('GET', '/1/status/mongodb', {}, {});
      expect(response).toHaveStatus(200);
      expect(response.body.success).toBe(false);
    });

    it('should return success is true when there are mongodb venues', async () => {
      await createUser({
        email: 'info@test.com',
      });

      const response = await request('GET', '/1/status/mongodb', {}, {});
      expect(response).toHaveStatus(200);
      expect(response.body.success).toBe(true);
    });
  });
});
