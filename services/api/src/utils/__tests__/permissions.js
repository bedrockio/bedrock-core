const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('../testing');
const { User, Role } = require('./../../models');
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
  it('userHasPermissions global context', async () => {
    await User.deleteMany({});
    await Role.deleteMany({});
    const superAdminRole = await Role.create({
      name: 'Super Admin',
      context: 'global',
      permissions: {
        shops: 'read-write',
        users: 'read-write',
      },
    });
    const superAdminUser = await User.create({
      email: 'admin@permissions.com',
      roles: [
        {
          context: 'global',
          role: superAdminRole._id,
        },
      ],
    });
    expect(await userHasAccess(superAdminUser, { context: 'global', level: 'read', endpoint: 'shops' })).toBe(true);
    expect(
      await userHasAccess(superAdminUser, { context: 'organization', level: 'read', endpoint: 'shops', target: '123' })
    ).toBe(true);
    expect(await userHasAccess(superAdminUser, { context: 'global', level: 'read', endpoint: 'unknown' })).toBe(false);
    expect(await userHasAccess(superAdminUser, { context: 'global', level: 'write', endpoint: 'shops' })).toBe(true);
    expect(await userHasAccess(superAdminUser, { context: 'global', level: 'write', endpoint: 'users' })).toBe(true);
    const limitedAdminRole = await Role.create({
      name: 'Limited Admin',
      context: 'global',
      permissions: {
        shops: 'read',
        users: 'none',
      },
    });
    const limitedAdminUser = await User.create({
      email: 'limited@permissions.com',
      roles: [
        {
          context: 'global',
          role: limitedAdminRole._id,
        },
      ],
    });
    expect(await userHasAccess(limitedAdminUser, { context: 'global', level: 'read', endpoint: 'shops' })).toBe(true);
    expect(await userHasAccess(limitedAdminUser, { context: 'global', level: 'read', endpoint: 'unknown' })).toBe(
      false
    );
    expect(await userHasAccess(limitedAdminUser, { context: 'global', level: 'write', endpoint: 'shops' })).toBe(false);
    expect(await userHasAccess(limitedAdminUser, { context: 'global', level: 'read', endpoint: 'users' })).toBe(false);
    expect(await userHasAccess(limitedAdminUser, { context: 'global', level: 'write', endpoint: 'users' })).toBe(false);
  });
  it('userHasPermissions organization context', async () => {
    await User.deleteMany({});
    await Role.deleteMany({});
    const organization1Id = new mongoose.Types.ObjectId();
    const organization2Id = new mongoose.Types.ObjectId();
    const organizationAdminRole = await Role.create({
      name: 'Organization Admin',
      context: 'organization',
      permissions: {
        shops: 'read-write',
        users: 'none',
      },
    });
    const organizationAdminUser = await User.create({
      email: 'admin@permissions.com',
      roles: [
        {
          context: 'organization',
          role: organizationAdminRole._id,
          target: organization1Id,
        },
      ],
    });
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'shops',
        target: organization1Id,
      })
    ).toBe(true);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'global',
        level: 'read',
        endpoint: 'shops',
        target: organization1Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'shops',
        target: organization2Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'unknown',
        target: organization1Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'write',
        endpoint: 'shops',
        target: organization1Id,
      })
    ).toBe(true);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'write',
        endpoint: 'shops',
        target: organization2Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'users',
        target: organization1Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(organizationAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'users',
        target: organization2Id,
      })
    ).toBe(false);
    const limitedAdminRole = await Role.create({
      name: 'Limited Admin',
      context: 'organization',
      permissions: {
        shops: 'read',
        users: 'none',
      },
    });
    const limitedAdminUser = await User.create({
      email: 'limitedadmin@permissions.com',
      roles: [
        {
          context: 'organization',
          role: limitedAdminRole._id,
          target: organization1Id,
        },
      ],
    });
    expect(
      await userHasAccess(limitedAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'shops',
        target: organization1Id,
      })
    ).toBe(true);
    expect(
      await userHasAccess(limitedAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'shops',
        target: organization2Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(limitedAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'unknown',
        target: organization1Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(limitedAdminUser, {
        context: 'organization',
        level: 'write',
        endpoint: 'shops',
        target: organization1Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(limitedAdminUser, {
        context: 'organization',
        level: 'read',
        endpoint: 'users',
        target: organization1Id,
      })
    ).toBe(false);
    expect(
      await userHasAccess(limitedAdminUser, {
        context: 'organization',
        level: 'write',
        endpoint: 'users',
        target: organization1Id,
      })
    ).toBe(false);
  });
});
