const { requirePermissions } = require('../permissions');
const { createUser, context } = require('../../testing');
const { Organization } = require('../../../models');

describe('requirePermissions', () => {
  it('should trigger an error if no auth user is set', async () => {
    const authUser = await createUser({
      email: 'test@test.com',
    });
    const middleware = requirePermissions({ scope: 'global', endpoint: 'users', permission: 'read' });
    let ctx;
    ctx = context({});
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'This endpoint requires authentication.');
    ctx = context({});
    ctx.state = { authUser };
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      "You don't have the right permissions (required permission: users.read)."
    );
  });

  it('should allow global access to specific endpoints', async () => {
    let ctx;

    const superAdmin = await createUser({
      email: 'admin@permissions.com',
      roles: [
        {
          scope: 'global',
          role: 'superAdmin',
        },
      ],
    });
    const user = await createUser({
      email: 'plain@permissions.com',
    });
    const middleware = requirePermissions({
      scope: 'global',
      endpoint: 'users',
      permission: 'read',
    });

    ctx = context({});
    await expect(middleware(ctx)).rejects.toHaveProperty('message', 'This endpoint requires authentication.');

    ctx = context({});
    ctx.state = { authUser: user };
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      "You don't have the right permissions (required permission: users.read)."
    );

    ctx = context({});
    ctx.state = { authUser: superAdmin };
    await expect(middleware(ctx, () => {})).resolves.not.toThrow();
  });

  it('should allow global access to organization endpoints', async () => {
    let ctx;

    const organization = await Organization.create({
      name: 'Default Organization',
    });

    const superAdmin = await createUser({
      email: 'admin@permissions.com',
      roles: [
        {
          scope: 'global',
          role: 'superAdmin',
        },
      ],
    });

    const user = await createUser({
      email: 'plain@permissions.com',
    });

    const middleware = requirePermissions({
      scope: 'organization',
      endpoint: 'users',
      permission: 'write',
    });

    ctx = context({});
    ctx.state = {
      organization,
      authUser: superAdmin,
    };
    await expect(middleware(ctx, () => {})).resolves.not.toThrow();

    ctx = context({});
    ctx.state = {
      organization,
      authUser: user,
    };
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      "You don't have the right permissions (required permission: users.write)."
    );
  });

  it('should test organization access', async () => {
    let ctx;

    const organization1 = await Organization.create({
      name: 'Default Organization',
    });

    const organization2 = await Organization.create({
      name: 'Other Organization',
    });

    const admin = await createUser({
      email: 'admin@permissions.com',
      roles: [
        {
          role: 'admin',
          scope: 'organization',
          scopeRef: organization1.id,
        },
      ],
    });

    const middleware = requirePermissions({
      scope: 'organization',
      endpoint: 'users',
      permission: 'read',
    });

    ctx = context({});
    ctx.state = {
      authUser: admin,
      organization: organization1,
    };
    await expect(middleware(ctx, () => {})).resolves.not.toThrow();

    ctx = context({});
    ctx.state = {
      authUser: admin,
      organization: organization2,
    };
    await expect(middleware(ctx)).rejects.toHaveProperty(
      'message',
      "You don't have the right permissions (required permission: users.read)."
    );
  });

  describe('shortcuts', () => {
    it('should allow a dot shortcut', async () => {
      let ctx;

      const superAdmin = await createUser({
        email: 'admin@permissions.com',
        roles: [
          {
            scope: 'global',
            role: 'superAdmin',
          },
        ],
      });

      const middleware = requirePermissions('users.read');
      ctx = context({});
      ctx.state = { authUser: superAdmin };
      await expect(middleware(ctx, () => {})).resolves.not.toThrow();
    });

    it('should be able to pass a scope', async () => {
      let ctx;

      const organization1 = await Organization.create({
        name: 'Default Organization',
      });

      const organization2 = await Organization.create({
        name: 'Other Organization',
      });

      const admin = await createUser({
        email: 'admin@permissions.com',
        roles: [
          {
            role: 'admin',
            scope: 'organization',
            scopeRef: organization1.id,
          },
        ],
      });

      const middleware = requirePermissions('users.read', 'organization');

      ctx = context({});
      ctx.state = {
        authUser: admin,
        organization: organization1,
      };
      await expect(middleware(ctx, () => {})).resolves.not.toThrow();

      ctx = context({});
      ctx.state = {
        authUser: admin,
        organization: organization2,
      };
      await expect(middleware(ctx)).rejects.toHaveProperty(
        'message',
        "You don't have the right permissions (required permission: users.read)."
      );
    });
  });
});
