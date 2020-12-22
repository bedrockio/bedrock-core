const endpointDefinitions = require('../permissions.json');
const endpoints = Object.keys(endpointDefinitions);
const validContexts = ['global', 'organization'];
const permissionValues = ['none', 'read', 'read-write'];
const permissionDefaultValue = 'none';
const mongoose = require('mongoose');

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

function createMaxPermissions(context) {
  const defaultPermissions = {};
  for (const endpoint of endpoints) {
    defaultPermissions[endpoint] = endpointDefinitions[endpoint].maximums[context] || 'none';
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

async function userHasAccess(user, { endpoint, level, context, target }) {
  if (!endpoint) throw new Error('Expected endpoint (e.g. users)');
  if (!level) throw new Error('Expected level (e.g. read)');
  if (!context) throw new Error('Expected context (e.g. organization)');
  if (!validContexts.includes(context)) throw new Error('Invalid context');
  const roles = [];
  // Gather all relevant roles
  for (const roleRef of user.roles) {
    const roleId = roleRef.role.toString();
    if (roleRef.context === 'global') {
      const role = await mongoose.models.Role.findById(roleId);
      if (role.deletedAt) continue;
      roles.push(role);
    } else {
      if (roleRef.context !== context) continue;
      // Only include target roles (e.g. matching organization ID) when not global context
      if (context !== 'global') {
        if (!target) continue;
        if (!roleRef.target) continue;
        const roleTargetId = roleRef.target.toString();
        if (target.toString() !== roleTargetId) continue;
      }
      const role = await mongoose.models.Role.findById(roleId);
      if (role.deletedAt) continue;
      roles.push(role);
    }
  }
  let hasAccess = false;
  for (const role of roles) {
    const permissionValue = role.permissions[endpoint] || 'none';
    if (meetsLevel(permissionValue, level)) {
      hasAccess = true;
    }
  }
  return hasAccess;
}

module.exports = {
  validContexts,
  endpointDefinitions,
  endpoints,
  permissionValues,
  createDefaultPermissions,
  createMaxPermissions,
  meetsLevel,
  permissionDefaultValue,
  validatePermissions,
  userHasAccess,
};
