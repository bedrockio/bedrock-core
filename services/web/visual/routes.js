/**
 * The screen matrix (change-ui-framework-to-shadcn.html §7.4).
 * Each entry is captured per Playwright project (desktop/mobile × light/dark).
 *
 * `migrated` marks screens already on shadcn — useful for running the gate only
 * over converted screens during the migration (e.g. `--grep @migrated`).
 */

// Logged-out screens — render with the web server alone (no API/session needed).
export const AUTH_ROUTES = [
  { path: '/login', name: 'login', migrated: true },
  { path: '/signup', name: 'signup', migrated: true },
  { path: '/forgot-password', name: 'forgot-password', migrated: true },
  { path: '/reset-password', name: 'reset-password', migrated: true },
  { path: '/confirm-code', name: 'confirm-code', migrated: true },
];

// Authenticated screens — require a seeded API session (see global-setup.js).
export const APP_ROUTES = [
  { path: '/', name: 'dashboard' },

  { path: '/shops', name: 'shops-list', migrated: true },
  { path: '/shops/new', name: 'shops-new' },

  { path: '/products', name: 'products-list', migrated: true },
  { path: '/products/new', name: 'products-new' },

  { path: '/users', name: 'users-list', migrated: true },
  { path: '/users/invites', name: 'users-invites', migrated: true },

  { path: '/organizations', name: 'organizations-list', migrated: true },

  { path: '/templates', name: 'templates-list', migrated: true },

  { path: '/applications', name: 'applications-list', migrated: true },

  // Volatile: the harness login writes audit rows (full-page height shifts);
  // load-only until migrated with deterministic masking.
  { path: '/audit-log', name: 'audit-log', skipScreenshot: true },

  { path: '/settings', name: 'settings' },
  { path: '/settings/notifications', name: 'settings-notifications' },
  // Volatile: the harness login creates a session row (full-page height shifts);
  // load-only until migrated with deterministic masking.
  { path: '/settings/security', name: 'settings-security', skipScreenshot: true },

  { path: '/this-route-does-not-exist', name: 'not-found' },
];
