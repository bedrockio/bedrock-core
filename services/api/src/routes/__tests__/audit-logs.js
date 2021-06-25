const { setupDb, teardownDb, request, createUser, createAdminUser } = require('../../utils/testing');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/audit-entries', () => {
  describe('POST /search', () => {
    it('should list audit logs', async () => {
      const admin = await createAdminUser();
      const response = await request('POST', '/1/audit-entries/search', {}, { user: admin });
      expect(response.status).toBe(200);
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const response = await request('POST', '/1/audit-entries/search', {}, { user });
      expect(response.status).toBe(401);
    });
  });
});
