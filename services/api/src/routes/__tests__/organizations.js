const { setupDb, teardownDb, request, createUser, createAdminUser } = require('../../utils/testing');
const { Organization } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/organizations', () => {
  describe('POST /search', () => {
    it('should list out organizations', async () => {
      const user = await createAdminUser();
      await Organization.create({
        name: 'org 1',
      });
      await Organization.create({
        name: 'org 2',
      });
      const response = await request('POST', '/1/organizations/search', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
    });
  });

  describe('POST /mine/search', () => {
    it('should list out own organizations', async () => {
      const [org1, org2, org3] = await Promise.all([
        Organization.create({
          name: 'org 1',
        }),
        Organization.create({
          name: 'org 2',
        }),
        Organization.create({
          name: 'org 3',
        }),
      ]);
      const user = await createUser({
        roles: [
          {
            role: 'admin',
            scope: 'organization',
            scopeRef: org1.id,
          },
          {
            role: 'admin',
            scope: 'organization',
            scopeRef: org3.id,
          },
        ],
      });
      const response = await request('POST', '/1/organizations/mine/search', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject([
        {
          name: 'org 1',
        },
        {
          name: 'org 3',
        },
      ]);
    });

    it('should not return all organizations', async () => {
      await Promise.all([
        Organization.create({
          name: 'org 1',
        }),
        Organization.create({
          name: 'org 2',
        }),
      ]);
      const user = await createUser();
      const response = await request('POST', '/1/organizations/mine/search', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /:organization', () => {
    it('should be able to access organization', async () => {
      const user = await createAdminUser();
      const organization = await Organization.create({
        name: 'org',
      });
      const response = await request('GET', `/1/organizations/${organization.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('org');
    });
  });

  describe('POST /', () => {
    it('should be able to create organization', async () => {
      const user = await createAdminUser();
      const response = await request(
        'POST',
        '/1/organizations',
        {
          name: 'org',
        },
        { user }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.name).toBe('org');
    });
  });

  describe('DELETE /:organization', () => {
    it('should be able to delete organization', async () => {
      const user = await createAdminUser();
      let organization = await Organization.create({
        name: 'org',
      });
      const response = await request('DELETE', `/1/organizations/${organization.id}`, {}, { user });
      expect(response.status).toBe(204);
      organization = await Organization.findByIdDeleted(organization.id);
      expect(organization.deletedAt).toBeDefined();
    });

    it('should not be able to delete organization if no permissions', async () => {
      const user = await createUser();
      let organization = await Organization.create({
        name: 'org',
      });
      const response = await request('DELETE', `/1/organizations/${organization.id}`, {}, { user });
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /:organization', () => {
    it('should be able to update organization', async () => {
      const user = await createAdminUser();
      let organization = await Organization.create({
        name: 'org',
      });
      const response = await request('PATCH', `/1/organizations/${organization.id}`, { name: 'hello' }, { user });
      expect(response.status).toBe(200);
      organization = await Organization.findById(organization.id);
      expect(organization.name).toBe('hello');
    });
  });
});
