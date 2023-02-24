const { requirePermissions } = require('../permissions');
const { createUser, context } = require('../../testing');

describe('permissions', () => {
  it('should trigger an error if no auth user is set', async () => {
    const authUser = await createUser({
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
    const superAdminUser = await createUser({
      email: 'admin@permissions.com',
      roles: [
        {
          scope: 'global',
          role: 'superAdmin',
        },
      ],
    });
    const plainUser = await createUser({
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
