import { PiGlobeHemisphereWestBold, PiHouseBold } from 'react-icons/pi';

const VALID_SCOPES = ['global', 'organization'];

// Note: this function is derived from the API and meant
// to be kept in sync. It is slightly modified to not use
// mongoose utility methods.
export function userHasAccess(user, options) {
  if (!user) {
    return false;
  }

  const { scope = 'global', permission = 'read', endpoint, scopeRef } = options;

  if (!endpoint) {
    throw new Error('Expected endpoint (e.g. users)');
  } else if (!permission) {
    throw new Error('Expected permission (e.g. read)');
  } else if (!scope) {
    throw new Error('Expected scope (e.g. organization)');
  } else if (!VALID_SCOPES.includes(scope)) {
    throw new Error('Invalid scope');
  }

  return user.roles.some((r) => {
    if (scope === 'global' && r.scope !== 'global') {
      return false;
    } else if (scope === 'organization' && r.scope === 'organization') {
      if (r.scopeRef !== scopeRef) {
        return false;
      }
    }

    const definition = r.roleDefinition;
    const allowed = definition?.permissions?.[endpoint];

    if (!definition) {
      throw new Error(`Unknown role "${r.role}".`);
    }

    if (Array.isArray(allowed)) {
      return allowed.includes(permission);
    } else if (allowed === permission || allowed === 'all') {
      return true;
    } else {
      return false;
    }
  });
}

export function userCanSwitchOrganizations(user) {
  if (!user) {
    return false;
  }
  const nonGlobalRoles = user.roles.filter((role) => {
    return role.scope !== 'organization';
  });
  if (nonGlobalRoles.length > 1) {
    return true;
  } else {
    return userHasAccess(user, {
      endpoint: 'organizations',
      permission: 'read',
      scope: 'global',
    });
  }
}

export function formatRoles(roles) {
  const labels = [];
  const scopeRefs = [];
  roles.forEach((role) => {
    if (role.scope === 'global') {
      labels.push({
        key: `global-${role.role}`,
        content: role.roleDefinition.name,
        icon: PiGlobeHemisphereWestBold,
      });
    } else {
      const key = `${role.role}-${role.scope}-${role.scopeRef}`;
      if (!scopeRefs.includes(key)) {
        scopeRefs.push(key);
        labels.push({
          key: key,
          content: role.roleDefinition.name,
          icon: PiHouseBold,
        });
      }
    }
  });
  return labels;
}
