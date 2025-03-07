import { describe, expect, it } from 'vitest';
import { userHasAccess } from './permissions';

const organization1Id = '662f11c8af6870637eab9f0f';
const organization2Id = '662f11c8af6870637eab9f0d';

const superAdmin = {
  email: 'admin@permissions.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: [
    {
      scope: 'global',
      role: 'superAdmin',
      roleDefinition: {
        name: 'Super Admin',
        allowScopes: ['global'],
        permissions: {
          applications: 'all',
          auditEntries: 'all',
          organizations: 'all',
          products: 'all',
          roles: 'all',
          shops: 'all',
          users: 'all',
        },
        allowAuthenticationOnRoles: ['admin', 'viewer'],
      },
    },
  ],
};

const admin = {
  email: 'admin@permissions.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: [
    {
      scope: 'organization',
      role: 'admin',
      scopeRef: organization1Id,
      roleDefinition: {
        name: 'Admin',
        allowScopes: ['organization'],
        permissions: {
          auditEntries: 'read',
          applications: 'all',
          products: 'all',
          roles: 'all',
          shops: 'all',
          users: 'all',
        },
      },
    },
  ],
};

const viewer = {
  email: 'viewer@permissions.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: [
    {
      scope: 'organization',
      role: 'viewer',
      scopeRef: organization1Id,
      roleDefinition: {
        name: 'Viewer',
        allowScopes: ['organization'],
        permissions: {
          applications: 'read',
          auditEntries: 'read',
          products: 'read',
          shops: 'read',
          users: 'read',
        },
      },
    },
  ],
};

describe('userHasAccess', () => {
  it('should validate correctly for super admin', async () => {
    expect(
      userHasAccess(superAdmin, {
        scope: 'global',
        permission: 'read',
        endpoint: 'users',
      }),
    ).toBe(true);

    expect(
      userHasAccess(superAdmin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: '123',
      }),
    ).toBe(true);

    expect(
      userHasAccess(superAdmin, {
        scope: 'global',
        permission: 'read',
        endpoint: 'unknown',
      }),
    ).toBe(false);

    expect(
      userHasAccess(superAdmin, {
        scope: 'global',
        permission: 'write',
        endpoint: 'users',
      }),
    ).toBe(true);

    expect(
      userHasAccess(superAdmin, {
        scope: 'global',
        permission: 'write',
        endpoint: 'users',
      }),
    ).toBe(true);
  });

  it('should validate correctly for organization admin', async () => {
    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      }),
    ).toBe(true);

    expect(
      userHasAccess(admin, {
        scope: 'global',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      }),
    ).toBe(false);

    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      }),
    ).toBe(false);

    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'unknown',
        scopeRef: organization1Id,
      }),
    ).toBe(false);

    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      }),
    ).toBe(true);

    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization2Id,
      }),
    ).toBe(false);

    expect(
      userHasAccess(admin, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      }),
    ).toBe(false);
  });

  it('should validate correctly for organization viewer', async () => {
    expect(
      userHasAccess(viewer, {
        scope: 'global',
        permission: 'read',
        endpoint: 'users',
      }),
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'global',
        permission: 'read',
        endpoint: 'unknown',
      }),
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'global',
        permission: 'write',
        endpoint: 'users',
      }),
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization1Id,
      }),
    ).toBe(true);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'users',
        scopeRef: organization2Id,
      }),
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'read',
        endpoint: 'unknown',
        scopeRef: organization1Id,
      }),
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      }),
    ).toBe(false);
    expect(
      userHasAccess(viewer, {
        scope: 'organization',
        permission: 'write',
        endpoint: 'users',
        scopeRef: organization1Id,
      }),
    ).toBe(false);
  });

  it('should assume global access', async () => {
    expect(
      userHasAccess(superAdmin, {
        permission: 'read',
        endpoint: 'users',
      }),
    ).toBe(true);

    expect(
      userHasAccess(superAdmin, {
        permission: 'read',
        endpoint: 'unknown',
      }),
    ).toBe(false);
  });

  it('should not error when no user passed', async () => {
    expect(
      userHasAccess(null, {
        scope: 'global',
        permission: 'read',
        endpoint: 'users',
      }),
    ).toBe(false);
  });
});
