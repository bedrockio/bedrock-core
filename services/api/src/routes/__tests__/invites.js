const jwt = require('jsonwebtoken');
const { assertMailSent } = require('postmark');
const { createInviteToken } = require('../../utils/auth/tokens');
const { request, createUser, createAdmin } = require('../../utils/testing');
const { User, Invite } = require('../../models');

describe('/1/invites', () => {
  describe('POST /accept', () => {
    it('should send an email to the registered user', async () => {
      const invite = await Invite.create({
        email: 'some@email.com',
        status: 'invited',
      });
      const token = createInviteToken(invite);
      const response = await request(
        'POST',
        '/1/invites/accept',
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          password: '123password!',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');

      const user = await User.findById(payload.sub);
      expect(user.firstName).toBe('Bob');
      expect(user.lastName).toBe('Johnson');
    });
  });

  describe('POST /search', () => {
    it('should list out invites', async () => {
      const user = await createAdmin();

      const invite1 = await Invite.create({
        email: 'usera@platform.com',
      });

      const invite2 = await Invite.create({
        email: 'userb@platform.com',
      });

      const response = await request(
        'POST',
        '/1/invites/search',
        {
          sort: {
            field: 'email',
            order: 'asc',
          },
        },
        { user }
      );

      expect(response.status).toBe(200);
      const body = response.body;
      expect(body.data[0].email).toBe(invite1.email);
      expect(body.data[1].email).toBe(invite2.email);
      expect(body.meta.total).toBe(2);
    });
  });

  describe('POST /', () => {
    it('should be able to create invite', async () => {
      const user = await createAdmin();
      const response = await request(
        'POST',
        '/1/invites',
        {
          emails: ['new@platform.com'],
        },
        { user }
      );
      expect(response.status).toBe(204);
      assertMailSent({
        email: 'new@platform.com',
      });
    });

    it('should throw an error if user already exists', async () => {
      await createUser({
        email: 'fake@fake.com',
      });
      const user = await createAdmin();
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
      const user = await createAdmin();
      const invite = await Invite.create({
        email: 'delete@platform.com',
      });
      const response = await request('POST', `/1/invites/${invite.id}/resend`, {}, { user });
      expect(response.status).toBe(204);
    });
  });

  describe('DELETE /:invite', () => {
    it('should be able to delete invite', async () => {
      const user = await createAdmin();
      const invite = await Invite.create({
        email: 'delete@platform.com',
      });
      const response = await request('DELETE', `/1/invites/${invite.id}`, {}, { user });
      expect(response.status).toBe(204);
      const dbInvite = await Invite.findByIdDeleted(invite.id);
      expect(dbInvite.deletedAt).toBeDefined();
    });
  });
});
