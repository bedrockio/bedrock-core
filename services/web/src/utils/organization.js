import { localStorage } from './storage';

const KEY = 'organizationId';

export function getOrganization() {
  return localStorage.getItem(KEY);
}

export function setOrganization(id) {
  console.info('SETTTTTTTTTING', id);
  if (id) {
    localStorage.setItem(KEY, id);
  } else {
    localStorage.removeItem(KEY);
  }

  // Organizations may affect the context of all pages as well as
  // persistent header/footer so need to do a hard-reload of the app.
  window.location.reload();
}
