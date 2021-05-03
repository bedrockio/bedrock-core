const { setupDb, teardownDb, request, createUser, createUserWithRole } = require('../../utils/testing');
const { User, AuditLog } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/audit-logs', () => {
  describe('POST /search', () => {
    it('should list audit logs', async () => {
      const admin = await createUserWithRole('global', 'superAdmin');
      const response = await request('POST', '/1/audit-logs/search', {}, { user: admin });
      expect(response.status).toBe(200);
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const response = await request('POST', '/1/audit-logs/search', {}, { user });
      expect(response.status).toBe(401);
    });
  });
});
