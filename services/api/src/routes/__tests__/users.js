const { request, createUser, createAdmin } = require('../../utils/testing');
const { mockTime, unmockTime, advanceTime } = require('../../utils/testing/time');
const { User, Shop, AuditEntry } = require('../../models');
const { importFixtures } = require('../../utils/fixtures');

describe('/1/users', () => {
  describe('GET /me', () => {
    it('should return the logged in user', async () => {
      const user = await createUser();
      const response = await request('GET', '/1/users/me', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should return the logged in user for fixture data', async () => {
      const user = await importFixtures('users/admin');
      const response = await request('GET', '/1/users/me', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should expose id getter', async () => {
      const user = await createUser();
      const response = await request('GET', '/1/users/me', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);
    });

    it('should not expose _id or __v', async () => {
      const user = await createUser();
      const response = await request('GET', '/1/users/me', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBeUndefined();
      expect(response.body.data.__v).toBeUndefined();
    });

    it('should not expose _password or hash', async () => {
      const user = await createUser({
        password: 'fake password',
      });
      const response = await request('GET', '/1/users/me', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data._password).toBeUndefined();
      expect(response.body.data.authenticators).toMatchObject([
        {
          type: 'password',
        },
      ]);
    });
  });

  describe('PATCH /me', () => {
    it('should allow updating the user', async () => {
      const user = await createUser();
      const response = await request('PATCH', '/1/users/me', { firstName: 'Other', lastName: 'Name' }, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(user.email);
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.firstName).toBe('Other');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.name).toBe('Other Name');
    });

    it('should be able to patch the device token', async () => {
      let user = await createUser();
      const response = await request(
        'PATCH',
        '/1/users/me',
        {
          deviceToken: 'new-token',
        },
        { user },
      );

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(user.email);
      user = await User.findById(user._id);
      expect(user.deviceToken).toBe('new-token');
    });
  });

  describe('POST /', () => {
    it('should be able to create user', async () => {
      const admin = await createAdmin();
      const response = await request(
        'POST',
        '/1/users',
        {
          email: 'hello@dominiek.com',
          password: 'verysecurepassword',
          firstName: 'Mellow',
          lastName: 'Yellow',
        },
        { user: admin },
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.firstName).toBe('Mellow');
      expect(data.lastName).toBe('Yellow');
      expect(data.name).toBe('Mellow Yellow');
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const response = await request(
        'POST',
        '/1/users',
        {
          email: 'hello@dominiek.com',
          password: 'verysecurepassword',
          passwordRepeat: 'verysecurepassword',
          firstName: 'Mellow',
          lastName: 'Yellow',
        },
        { user },
      );
      expect(response.status).toBe(403);
    });

    it('should error on invalid roles', async () => {
      const admin = await createAdmin();
      const response = await request(
        'POST',
        '/1/users',
        {
          email: 'hello@dominiek.com',
          password: 'verysecurepassword',
          firstName: 'Mellow',
          lastName: 'Yellow',
          roles: [
            {
              role: 'superAdmin',
              scope: 'organization',
            },
          ],
        },
        { user: admin },
      );
      expect(response.status).toBe(400);
    });
  });

  describe('GET /:user', () => {
    it('should be able to access user', async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ firstName: 'Neo', lastName: 'One' });
      const response = await request('GET', `/1/users/${user1.id}`, {}, { user: admin });
      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe(user1.firstName);
      expect(response.body.data.lastName).toBe(user1.lastName);
    });
    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const user1 = await createUser({ firstName: 'New', lastName: 'Name' });
      const response = await request('GET', `/1/users/${user1.id}`, {}, { user });
      expect(response.status).toBe(403);
    });
  });

  describe('POST /:user/autheticate', () => {
    it('should be able to authenticate as another user', async () => {
      let response;
      let superAdmin = await createAdmin({
        firstName: 'Joe',
        lastName: 'Admin',
      });
      let user = await createUser({
        firstName: 'Neo',
        lastName: 'One',
      });

      response = await request(
        'POST',
        `/1/users/${user.id}/authenticate`,
        {},
        {
          user: superAdmin,
        },
      );
      expect(response.status).toBe(200);

      const auditEntry = await AuditEntry.findOne({
        actor: superAdmin.id,
        activity: 'Authenticated as user',
      });
      expect(auditEntry.objectType).toBe('User');
      expect(auditEntry.object).toBe(user.id);

      superAdmin = await User.findById(superAdmin.id);
      user = await User.findById(user.id);

      expect(superAdmin.authTokens.length).toBe(1);
      expect(user.authTokens.length).toBe(0);

      const { token } = response.body.data;
      response = await request(
        'GET',
        '/1/users/me',
        {},
        {
          token,
        },
      );
      expect(response.body.data.name).toBe('Neo One');
    });

    it('should not allow impersonation for more than 1 hour', async () => {
      mockTime('2020-01-01T00:00:00.000Z');

      let response;

      let superAdmin = await createAdmin({
        firstName: 'Joe',
        lastName: 'Admin',
      });
      let user = await createUser({
        firstName: 'Neo',
        lastName: 'One',
      });

      response = await request(
        'POST',
        `/1/users/${user.id}/authenticate`,
        {},
        {
          user: superAdmin,
        },
      );
      expect(response.status).toBe(200);

      advanceTime(60 * 60 * 1000);

      const { token } = response.body.data;
      response = await request(
        'GET',
        '/1/users/me',
        {},
        {
          token,
        },
      );
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('jwt expired');
      unmockTime();
    });

    it('dont allow an superAdmin to authenticate as another admin', async () => {
      const superAdmin = await createAdmin();
      const user = await createAdmin();
      const response = await request('POST', `/1/users/${user.id}/authenticate`, {}, { user: superAdmin });
      expect(response.status).toBe(403);
      expect(response.body.error.message).toBe('You are not allowed to authenticate as this user');
    });

    it('should deny access to non-admins', async () => {
      const authUser = await createUser({});
      const user = await createUser({ firstName: 'New', lastName: 'Name' });
      const response = await request('POST', `/1/users/${user.id}/authenticate`, {}, { user: authUser });
      expect(response.status).toBe(403);
    });
  });

  describe('POST /search', () => {
    it('should list out users', async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ firstName: 'Neo', lastName: 'One' });
      const user2 = await createUser({ firstName: 'Riker', lastName: 'Two' });

      const response = await request('POST', '/1/users/search', {}, { user: admin });
      expect(response.status).toBe(200);
      const body = response.body;
      const names = body.data.map((i) => i.name);
      expect(names.includes(user1.name)).toBe(true);
      expect(names.includes(user2.name)).toBe(true);
      expect(body.meta.total > 2).toBe(true);
    });

    it('should be able to search by ids', async () => {
      const admin = await createAdmin();

      const user1 = await createUser({ firstName: 'Neo', lastName: 'One' });
      const user2 = await createUser({ firstName: 'Riker', lastName: 'Two' });

      const response = await request(
        'POST',
        '/1/users/search',
        {
          ids: [user1.id, user2.id],
          sort: {
            field: 'firstName',
            order: 'asc',
          },
        },
        { user: admin },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].id).toBe(user1.id);
      expect(response.body.data[1].id).toBe(user2.id);
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const response = await request('POST', '/1/users/search', {}, { user });
      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /:user', () => {
    it('admins should be able to update user', async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ firstName: 'Old', lastName: 'Name' });
      const response = await request(
        'PATCH',
        `/1/users/${user1.id}`,
        { firstName: 'New', lastName: 'Name' },
        { user: admin },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('New');
      expect(response.body.data.lastName).toBe('Name');
      const dbUser = await User.findById(user1.id);
      expect(dbUser.name).toEqual('New Name');
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const user1 = await createUser({ firstName: 'New', lastName: 'Name' });
      const response = await request('PATCH', `/1/users/${user1.id}`, { name: 'new name' }, { user });
      expect(response.status).toBe(403);
    });

    it('should be able to update user roles', async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ firstName: 'New', lastName: 'Name' });
      const response = await request(
        'PATCH',
        `/1/users/${user1.id}`,
        {
          roles: [
            {
              role: 'admin',
              scope: 'global',
            },
          ],
        },
        { user: admin },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.roles.length).toBe(1);
      expect(response.body.data.roles[0].role).toBe('admin');
      expect(response.body.data.roles[0].scope).toBe('global');
      const dbUser = await User.findById(user1.id);
      expect(dbUser.roles.length).toBe(1);
      expect(dbUser.roles[0].role).toBe('admin');
      expect(dbUser.roles[0].scope).toBe('global');
    });

    it('should error on invalid roles', async () => {
      const admin = await createAdmin();
      const user = await createUser({ firstName: 'New', lastName: 'Name' });
      const response = await request(
        'PATCH',
        `/1/users/${user.id}`,
        {
          roles: [
            {
              role: 'superAdmin',
              scope: 'organization',
            },
          ],
        },
        { user: admin },
      );
      expect(response.status).toBe(400);
    });

    it('should strip out reserved fields', async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ firstName: 'New', lastName: 'Name' });
      const response = await request(
        'PATCH',
        `/1/users/${user1.id}`,
        {
          firstName: 'New',
          lastName: 'Name',
          id: 'fake id',
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
        },
        { user: admin },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('New');
      expect(response.body.data.lastName).toBe('Name');
      const dbUser = await User.findById(user1.id);
      expect(dbUser.name).toEqual('New Name');
    });

    it('should strip out password', async () => {
      const admin = await createAdmin();
      let user = await createUser({ name: 'new name' });
      const response = await request(
        'PATCH',
        `/1/users/${user.id}`,
        {
          password: 'new password',
          _password: 'new password',
        },
        { user: admin },
      );
      expect(response.status).toBe(200);
      user = await User.findById(user.id);
      expect(user.password).toBeUndefined();
      expect(user._password).toBeUndefined();
      expect(user.authenticators).toEqual([]);
    });
  });

  describe('DELETE /:user', () => {
    it('should be able to delete user', async () => {
      const admin = await createAdmin();
      const user1 = await createUser({ firstName: 'Neo', lastName: 'One' });
      const response = await request('DELETE', `/1/users/${user1.id}`, {}, { user: admin });
      expect(response.status).toBe(204);
      const dbUser = await User.findByIdDeleted(user1.id);
      expect(dbUser.deletedAt).toBeDefined();

      const auditEntry = await AuditEntry.findOne({
        activity: 'Deleted user',
        actor: admin.id,
      });
      expect(auditEntry.objectType).toBe('User');
      expect(auditEntry.object).toBe(user1.id);
    });

    it('should throw an error when referenced by a shop', async () => {
      const user = await createUser();
      const admin = await createAdmin();

      await Shop.create({
        name: 'My Shop',
        owner: user,
      });

      const response = await request('DELETE', `/1/users/${user.id}`, {}, { user: admin });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Refusing to delete User.');
    });

    it('should not error for allowed refernces', async () => {
      const user = await createUser();
      const admin = await createAdmin();

      await AuditEntry.create({
        activity: 'fake ',
        requestMethod: 'fake',
        requestUrl: 'fake',
        actor: user,
      });

      const response = await request('DELETE', `/1/users/${user.id}`, {}, { user: admin });
      expect(response.status).toBe(204);
    });

    it('should deny access to non-admins', async () => {
      const user = await createUser({});
      const user1 = await createUser({ firstName: 'Neo', lastName: 'One' });
      const response = await request('DELETE', `/1/users/${user1.id}`, {}, { user });
      expect(response.status).toBe(403);
    });
  });
});
