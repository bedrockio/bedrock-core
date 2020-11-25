const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');
const { Invite } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/invites', () => {
  describe('POST /search', () => {
    it('it should list out invites', async () => {
      const user = await createUser({
        roles: ['admin'],
      });

      const invite1 = await Invite.create({
        email: 'usera@platform.com',
      });

      const invite2 = await Invite.create({
        email: 'userb@platform.com',
      });

      const response = await request('POST', '/1/invites/search', {}, { user });

      expect(response.status).toBe(200);
      const body = response.body;
      expect(body.data[0].email).toBe(invite1.email);
      expect(body.data[1].email).toBe(invite2.email);
      expect(body.meta.total).toBe(2);
    });
  });

  describe('POST /', () => {
    it('should be able to create invite', async () => {
      const user = await createUser({
        roles: ['admin'],
      });
      const response = await request(
        'POST',
        '/1/invites',
        {
          emails: ['new@platform.com'],
        },
        { user }
      );
      expect(response.status).toBe(204);
    });
    it('should throw an error if user already exists', async () => {
      const user = await createUser({
        roles: ['admin'],
      });
      const response = await request(
        'POST',
        '/1/invites',
        {
          emails: ['fake@fake.com'],
        },
        { user }
      );
      expect(response.status).toBe(400);
    });
  });

  describe('POST /:invite/resend', () => {
    it('should be able to resend invite', async () => {
      const user = await createUser({
        roles: ['admin'],
      });
      const invite = await Invite.create({
        email: 'delete@platform.com',
      });
      const response = await request('POST', `/1/invites/${invite.id}/resend`, {}, { user });
      expect(response.status).toBe(204);
    });
  });

  describe('DELETE /:invite', () => {
    it('should be able to delete invite', async () => {
      const user = await createUser({
        roles: ['admin'],
      });
      const invite = await Invite.create({
        email: 'delete@platform.com',
      });
      const response = await request('DELETE', `/1/invites/${invite.id}`, {}, { user });
      expect(response.status).toBe(204);
      const dbInvite = await Invite.findById(invite.id);
      expect(dbInvite.deletedAt).toBeDefined();
    });
  });
});
