const endpointDefinitions = require('../permissions.json');
const endpoints = Object.keys(endpointDefinitions);
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

function validatePermissions(context, permissions) {
  const endpoints = Object.keys(permissions);
  for (const endpoint of endpoints) {
    if (endpoint[0] === '$') continue;
    const permissionValue = permissions[endpoint] || 'none';
    const maximumPermissionValue = endpointDefinitions[endpoint].maximums[context] || 'none';
    if (!permissionWithinBounds(maximumPermissionValue, permissionValue)) {
      throw new Error(
        `Permission ${permissionValue} for endpoint ${endpoint} exceeds maximum permission ${maximumPermissionValue} in context ${context}`
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

function meetsLevel(permissionValue, level) {
  if (permissionValue === 'none') return false;
  if (permissionValue === 'read-write' && level === 'write') return true;
  if (permissionValue === 'read-write' && level === 'read') return true;
  if (permissionValue === 'read' && level === 'read') return true;
  return false;
}

module.exports = {
  endpointDefinitions,
  endpoints,
  permissionValues,
  createDefaultPermissions,
  meetsLevel,
  permissionDefaultValue,
  validatePermissions,
};
