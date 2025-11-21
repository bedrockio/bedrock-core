const { request, createUser, createAdmin } = require('../utils/testing');
const { uniqueId } = require('lodash');
const { Application, AuditEntry } = require('../models');

describe('/1/applications', () => {
  describe('POST /search', () => {
    it('should list applications', async () => {
      const admin = await createAdmin();
      const otherAdmin = await createAdmin();

      await Application.create({
        name: 'my application',
        user: admin.id,
        apiKey: uniqueId('key'),
      });

      await Application.create({
        name: 'my application',
        user: otherAdmin.id,
        apiKey: uniqueId('key'),
      });

      const response = await request('POST', '/1/applications/search', {}, { user: admin });
      expect(response).toHaveStatus(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should deny access to users with no access', async () => {
      const user = await createUser({});
      const response = await request('POST', '/1/applications/search', {}, { user });
      expect(response).toHaveStatus(403);
    });
  });

  describe('GET /:application', () => {
    it('should get an application', async () => {
      const admin = await createAdmin();
      const application = await Application.create({
        name: 'my application',
        user: admin.id,
        apiKey: uniqueId('key'),
      });
      const response = await request('GET', `/1/applications/${application.id}`, {}, { user: admin });
      expect(response).toHaveStatus(200);
    });
  });

  describe('POST /', () => {
    it('should allow creation', async () => {
      const admin = await createAdmin();
      const response = await request(
        'POST',
        '/1/applications',
        {
          name: 'bob',
        },
        { user: admin },
      );
      expect(response).toHaveStatus(200);
      const application = await Application.findOne({ _id: response.body.data.id });
      expect(application.name).toBe('bob');

      const auditEntry = await AuditEntry.findOne({
        object: application.id,
      });
      expect(auditEntry.activity).toBe('Created application');
      expect(auditEntry.actor).toEqual(admin._id);
      expect(auditEntry.ownerId).toBe(admin.id);
    });
  });

  describe('PATCH /:application', () => {
    it('should patch an application', async () => {
      const admin = await createAdmin();
      const application = await Application.create({
        name: 'patch-application',
        user: admin.id,
        apiKey: uniqueId('key'),
      });

      const response = await request(
        'PATCH',
        `/1/applications/${application.id}`,
        {
          name: 'bob',
        },
        { user: admin },
      );
      expect(response).toHaveStatus(200);
      expect(response.body.data.name).toBe('bob');
      const dbApplication = await Application.findOne({ _id: response.body.data.id });
      expect(dbApplication.name).toBe('bob');

      const auditEntry = await AuditEntry.findOne({
        object: application.id,
        include: 'actor',
      });
      expect(auditEntry.activity).toBe('Updated application');
      expect(auditEntry.actor.id).toBe(admin.id);
      expect(auditEntry.objectBefore).toEqual({
        name: 'patch-application',
      });
      expect(auditEntry.objectAfter).toEqual({
        name: 'bob',
      });
    });
  });

  describe('DELETE /:application', () => {
    it('should delete application', async () => {
      const admin = await createAdmin();
      const application = await Application.create({
        name: 'patch-application',
        user: admin.id,
        apiKey: uniqueId('key'),
      });

      const response = await request('DELETE', `/1/applications/${application.id}`, {}, { user: admin });
      expect(response).toHaveStatus(204);

      const dbApplication = await Application.findById(application.id);
      expect(dbApplication).toBe(null);

      const auditEntry = await AuditEntry.findOne({
        object: application.id,
      });
      expect(auditEntry.activity).toBe('Deleted application');
      expect(auditEntry.actor).toEqual(admin._id);
    });
  });
});
