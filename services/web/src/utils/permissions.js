function meetsLevel(permissionValue, permission) {
  if (permissionValue === 'none') return false;
  if (permissionValue === 'read-write' && permission === 'write') return true;
  if (permissionValue === 'read-write' && permission === 'read') return true;
  if (permissionValue === 'read' && permission === 'read') return true;
  return false;
}

export function userHasAccess(user, { endpoint, permission, scope, scopeRef }) {
  if (!endpoint) throw new Error('Expected endpoint (e.g. users)');
  if (!permission) throw new Error('Expected permission (e.g. read)');
  if (!scope) throw new Error('Expected scope (e.g. account)');
  const roles = [];
  // Gather all relevant roles
  for (const roleRef of user.roles) {
    if (roleRef.scope === 'global') {
      const role = roleRef.roleDefinition;
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
      const role = roleRef.roleDefinition;
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

export function userCanSwitchOrganizations(user) {
  const nonGlobalRoles = user.roles.filter((role) => {
    return role.scope !== 'organization';
  });
  if (nonGlobalRoles.length > 1) {
    return true;
  } else {
    return userHasAccess(user, { endpoint: 'organizations', permission: 'read', scope: 'global' });
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
        icon: 'globe',
      });
    } else {
      const key = `${role.role}-${role.scope}-${role.scopeRef}`;
      if (!scopeRefs.includes(key)) {
        scopeRefs.push(key);
        labels.push({
          key: key,
          content: role.roleDefinition.name,
          icon: 'building',
        });
      }
    }
  });
  return labels;
}
