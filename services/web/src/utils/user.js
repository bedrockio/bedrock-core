export function hasAccess(user) {
  return user?.roles.some((r) => {
    return r.role === 'viewer' || r.role === 'admin' || r.role === 'superAdmin';
  });
}

export function isAdmin(user) {
  return user?.roles.some((r) => {
    return r.role === 'admin' || r.role === 'superAdmin';
  });
}

export function hasRoles(user, roles) {
  return user?.roles.some((r) => {
    return roles.includes(r.role);
  });
}
