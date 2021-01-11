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
    const roleId = roleRef.role.toString();
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
