import { request, createUser, createAdmin } from '../utils/testing/index.js';
import { AuditEntry } from '../models/index.js';

describe('/1/audit-entries', () => {
  describe('POST /search', () => {
    it('should list audit entries', async () => {
      const admin = await createAdmin();
      const response = await request('POST', '/1/audit-entries/search', {}, { user: admin });
      expect(response).toHaveStatus(200);
    });

    it('should filter on entries owned by the user', async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const other = await createUser();

      const entry = await AuditEntry.create({
        activity: 'did something',
        requestMethod: 'POST',
        requestUrl: '/1/shops',
        actor: other,
        ownerId: user.id,
        ownerType: 'User',
      });

      const response = await request('POST', '/1/audit-entries/search', { user: user.id }, { user: admin });
      expect(response).toHaveStatus(200);
      expect(response.body.data.map((e) => e.id)).toEqual([entry.id]);
    });

    it('should filter on entries where the user is the actor or object', async () => {
      const admin = await createAdmin();
      const user = await createUser();
      const other = await createUser();

      const asActor = await AuditEntry.create({
        activity: 'did something',
        requestMethod: 'POST',
        requestUrl: '/1/shops',
        actor: user,
      });
      const asObject = await AuditEntry.create({
        activity: 'did something',
        requestMethod: 'POST',
        requestUrl: '/1/shops',
        actor: other,
        object: user.id,
        objectType: 'User',
      });
      await AuditEntry.create({
        activity: 'did something',
        requestMethod: 'POST',
        requestUrl: '/1/shops',
        actor: other,
      });

      const response = await request('POST', '/1/audit-entries/search', { user: user.id }, { user: admin });
      expect(response).toHaveStatus(200);
      expect(response.body.data.map((e) => e.id).sort()).toEqual([asActor.id, asObject.id].sort());
    });

    it('should export as csv', async () => {
      const admin = await createAdmin();
      const response = await request('POST', '/1/audit-entries/search', { format: 'csv' }, { user: admin });
      expect(response).toHaveStatus(200);
    });

    it('should reject a user that is not an object id', async () => {
      const admin = await createAdmin();
      const response = await request('POST', '/1/audit-entries/search', { user: 'not-an-id' }, { user: admin });
      expect(response).toHaveStatus(400);
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const response = await request('POST', '/1/audit-entries/search', {}, { user });
      expect(response).toHaveStatus(403);
    });
  });
});
