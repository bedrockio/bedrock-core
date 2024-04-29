const roleDefinitions = require('../roles.json');
const { serializeDocument } = require('./serialize');
const { isEqual } = require('./document');

const VALID_SCOPES = ['global', 'organization'];

function userHasAccess(user, options) {
  const { endpoint, permission, scope = 'global', scopeRef } = options;
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
      if (!isEqual(r.scopeRef, scopeRef)) {
        return false;
      }
    }

    const definition = roleDefinitions[r.role];
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

function expandRoles(user, ctx) {
  const { roles = [], ...rest } = serializeDocument(user, ctx);
  return {
    ...rest,
    roles: roles.map((obj) => {
      return {
        ...obj,
        roleDefinition: roleDefinitions[obj.role],
      };
    }),
  };
}

module.exports = {
  userHasAccess,
  expandRoles,
};
