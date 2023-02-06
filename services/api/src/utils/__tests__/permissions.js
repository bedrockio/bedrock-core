const mongoose = require('mongoose');
const { User } = require('./../../models');
const { validatePermissions, userHasAccess } = require('../permissions');

describe('permissions', () => {
  it('validatePermissions', () => {
    const validation1 = () => {
      return validatePermissions('global', { users: 'read-write' });
    };
    expect(validation1()).toBe(true);
    const validation2 = () => {
      return validatePermissions('global', { users: 'none' });
    };
    expect(validation2()).toBe(true);
    const validation3 = () => {
      return validatePermissions('global', { invoices: 'read-write' });
    };
    expect(validation3).toThrow(Error);
  });

  it('should validate correctly for super admin', async () => {
    const superAdmin = await User.create({
      email: 'admin@permissions.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          scope: 'global',
          role: 'superAdmin',
        },
      ],
    });
    expect(userHasAccess(superAdmin, { scope: 'global', permission: 'read', endpoint: 'users' })).toBe(true);
    expect(
      userHasAccess(superAdmin, { scope: 'organization', permission: 'read', endpoint: 'users', scopeRef: '123' })
    ).toBe(true);
    expect(userHasAccess(superAdmin, { scope: 'global', permission: 'read', endpoint: 'unknown' })).toBe(false);
    expect(userHasAccess(superAdmin, { scope: 'global', permission: 'write', endpoint: 'users' })).toBe(true);
    expect(userHasAccess(superAdmin, { scope: 'global', permission: 'write', endpoint: 'users' })).toBe(true);
  });

  it('should validate correctly for organization admin', async () => {
    const organization1Id = new mongoose.Types.ObjectId();
    const organization2Id = new mongoose.Types.ObjectId();
    const admin = await User.create({
      email: 'admin@permissions.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          scope: 'organization',
          role: 'admin',
          scopeRef: organization1Id,
        },
      ],
    });
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(true);
    expect(
      userHasAccess(admin, {
        scope: 'global',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'unknown',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(true);
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
  });

  it('should validate correctly for organization viewer', async () => {
    const organization1Id = new mongoose.Types.ObjectId();
    const organization2Id = new mongoose.Types.ObjectId();
    const viewer = await User.create({
      email: 'viewer@permissions.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          scope: 'organization',
          role: 'viewer',
          scopeRef: organization1Id,
        },
      ],
    });
    expect(userHasAccess(viewer, { scope: 'global', permission: 'read', endpoint: 'users' })).toBe(false);
    expect(userHasAccess(viewer, { scope: 'global', permission: 'read', endpoint: 'unknown' })).toBe(false);
    expect(userHasAccess(viewer, { scope: 'global', permission: 'write', endpoint: 'users' })).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(true);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'unknown',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(false);
  });
});
