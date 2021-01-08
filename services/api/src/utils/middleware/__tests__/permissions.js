const { requirePermissions } = require('../permissions');
const { setupDb, teardownDb, context } = require('../../testing');
const { User } = require('./../../../models');

beforeAll(async () => {
  await setupDb();
  await User.deleteMany({});
});

afterAll(async () => {
  await teardownDb();
});

describe('permissions', () => {
  it('should trigger an error if no auth user is set', async () => {
    const authUser = await User.create({
      email: 'test@test.com',
    });
    const middleware = requirePermissions({ scope: 'global', endpoint: 'users', permission: 'read' });
    let ctx;
    ctx = context({});
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'This endpoint requires authentication');
    ctx = context({});
    ctx.state = { authUser };
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      "You don't have the right permission for endpoint users (required permission: global/read)"
    );
  });
  it('should allow global role based access control to certain endpoints', async () => {
    const superAdminUser = await User.create({
      email: 'admin@permissions.com',
      roles: [
        {
          scope: 'global',
          role: 'superAdmin',
        },
      ],
    });
    const plainUser = await User.create({
      email: 'plain@permissions.com',
    });
    const middleware = requirePermissions({ scope: 'global', endpoint: 'users', permission: 'read' });
    let ctx;
    ctx = context({});
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'This endpoint requires authentication');
    ctx = context({});
    ctx.state = { authUser: plainUser };
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      "You don't have the right permission for endpoint users (required permission: global/read)"
    );
    ctx = context({});
    ctx.state = { authUser: superAdminUser };
    await expect(middleware(ctx, () => {})).resolves.toBe(undefined);
  });
});
