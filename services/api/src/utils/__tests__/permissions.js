const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('../testing');
const { User } = require('./../../models');
const { validatePermissions, userHasAccess } = require('../permissions');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

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
  it('userHasPermissions global scope', async () => {
    await User.deleteMany({});
    const superAdminUser = await User.create({
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
    expect(userHasAccess(superAdminUser, { scope: 'global', permission: 'read', endpoint: 'users' })).toBe(true);
    expect(
      userHasAccess(superAdminUser, { scope: 'organization', permission: 'read', endpoint: 'users', scopeRef: '123' })
    ).toBe(true);
    expect(userHasAccess(superAdminUser, { scope: 'global', permission: 'read', endpoint: 'unknown' })).toBe(false);
    expect(userHasAccess(superAdminUser, { scope: 'global', permission: 'write', endpoint: 'users' })).toBe(true);
    expect(userHasAccess(superAdminUser, { scope: 'global', permission: 'write', endpoint: 'users' })).toBe(true);
    const limitedAdminUser = await User.create({
      email: 'limited@permissions.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          scope: 'global',
          role: 'limitedAdmin',
        },
      ],
    });
    expect(userHasAccess(limitedAdminUser, { scope: 'global', permission: 'read', endpoint: 'users' })).toBe(true);
    expect(userHasAccess(limitedAdminUser, { scope: 'global', permission: 'read', endpoint: 'unknown' })).toBe(false);
    expect(userHasAccess(limitedAdminUser, { scope: 'global', permission: 'write', endpoint: 'users' })).toBe(false);
  });
  it('userHasPermissions organization scope', async () => {
    await User.deleteMany({});
    const organization1Id = new mongoose.Types.ObjectId();
    const organization2Id = new mongoose.Types.ObjectId();
    const organizationAdminUser = await User.create({
      email: 'admin@permissions.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          scope: 'organization',
          role: 'superAdmin',
          scopeRef: organization1Id,
        },
      ],
    });
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(true);
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'global',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'unknown',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(true);
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(organizationAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    const limitedAdminUser = await User.create({
      email: 'limitedadmin@permissions.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          scope: 'organization',
          role: 'limitedAdmin',
          scopeRef: organization1Id,
        },
      ],
    });
    expect(
      userHasAccess(limitedAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(true);
    expect(
      userHasAccess(limitedAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(limitedAdminUser, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'unknown',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(limitedAdminUser, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(false);
    expect(
      userHasAccess(limitedAdminUser, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      })
    ).toBe(false);
  });
});
