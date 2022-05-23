const roleDefinitions = require('../roles.json');
const endpointDefinitions = require('../permissions.json');
const endpoints = Object.keys(endpointDefinitions);
const validScopes = ['global', 'organization'];
const permissionValues = ['none', 'read', 'read-write'];
const permissionDefaultValue = 'none';

function permissionWithinBounds(maximumValue, value) {
  if (maximumValue === 'none' && value === 'none') return true;
  if (maximumValue === 'read' && value === 'none') return true;
  if (maximumValue === 'read' && value === 'read') return true;
  if (maximumValue === 'read-write' && value === 'none') return true;
  if (maximumValue === 'read-write' && value === 'read') return true;
  if (maximumValue === 'read-write' && value === 'read-write') return true;
  return false;
}

function validatePermissions(scope, permissions) {
  const endpoints = Object.keys(permissions);
  for (const endpoint of endpoints) {
    if (endpoint[0] === '$') continue;
    const permissionValue = permissions[endpoint] || 'none';
    const maximumPermissionValue = endpointDefinitions[endpoint].maximums[scope] || 'none';
    if (!permissionWithinBounds(maximumPermissionValue, permissionValue)) {
      throw new Error(
        `Permission ${permissionValue} for endpoint ${endpoint} exceeds maximum permission ${maximumPermissionValue} in scope ${scope}`
      );
    }
  }
  return true;
}

function createDefaultPermissions() {
  const defaultPermissions = {};
  for (const endpoint of endpoints) {
    defaultPermissions[endpoint] = { type: String, enum: permissionValues, default: permissionDefaultValue };
  }
  return defaultPermissions;
}

function createMaxPermissions(scope) {
  const defaultPermissions = {};
  for (const endpoint of endpoints) {
    defaultPermissions[endpoint] = endpointDefinitions[endpoint].maximums[scope] || 'none';
  }
  return defaultPermissions;
}

function meetsLevel(permissionValue, requiredPermission) {
  if (permissionValue === 'none') return false;
  if (permissionValue === 'read-write' && requiredPermission === 'write') return true;
  if (permissionValue === 'read-write' && requiredPermission === 'read') return true;
  if (permissionValue === 'read' && requiredPermission === 'read') return true;
  return false;
}

function userHasAccess(user, { endpoint, permission, scope, scopeRef }) {
  if (!endpoint) throw new Error('Expected endpoint (e.g. users)');
  if (!permission) throw new Error('Expected permission (e.g. read)');
  if (!scope) throw new Error('Expected scope (e.g. organization)');
  if (!validScopes.includes(scope)) throw new Error('Invalid scope');
  const roles = [];
  // Gather all relevant roles
  for (const roleRef of user.roles) {
    const roleId = roleRef.role.toString();
    if (roleRef.scope === 'global') {
      const role = roleDefinitions[roleId];
      if (!role) continue;
      roles.push(role);
    } else {
      if (roleRef.scope !== scope) continue;
      // Only include scopeRef roles (e.g. matching organization ID) when not global scope
      if (scope !== 'global') {
        if (!scopeRef) continue;
        if (!roleRef.scopeRef) continue;
        const roleTargetId = roleRef.scopeRef.toString();
        if (scopeRef.toString() !== roleTargetId) continue;
      }
      const role = roleDefinitions[roleId];
      if (!role) continue;
      roles.push(role);
    }
  }
  let hasAccess = false;
  for (const role of roles) {
    const permissionValue = role.permissions[endpoint] || 'none';
    if (meetsLevel(permissionValue, permission)) {
      hasAccess = true;
    }
  }
  return hasAccess;
}

function expandRoles(user) {
  return {
    ...user.toJSON(),
    roles: user.toJSON().roles.map((roleRef) => {
      return {
        ...roleRef,
        roleDefinition: roleDefinitions[roleRef.role],
      };
    }),
  };
}

function mergeRoles(...roles) {
  const mergedRoles = {};

  for (const role of roles) {
    mergedRoles[`${role.role}${role.scope}${role.scopeRef || ''}`] = role;
  }

  return Object.values(mergedRoles);
}

module.exports = {
  validScopes,
  endpointDefinitions,
  endpoints,
  permissionValues,
  createDefaultPermissions,
  createMaxPermissions,
  meetsLevel,
  permissionDefaultValue,
  validatePermissions,
  userHasAccess,
  expandRoles,
  mergeRoles,
};
