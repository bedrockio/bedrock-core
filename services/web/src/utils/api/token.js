import { snakeCase } from 'lodash-es';

import { APP_NAME } from 'utils/env';
import { localStorage, sessionStorage } from 'utils/storage';

export const JWT_KEY = `${snakeCase(APP_NAME)}_jwt`;

export function hasToken() {
  return !!getToken();
}

let storage = localStorage;

// If we have a JWT_KEY in sessionStorage, use that instead
// used by LoginAsUser modal
if (sessionStorage.getItem(JWT_KEY)) {
  storage = sessionStorage;
}

export function getToken() {
  return storage.getItem(JWT_KEY);
}

export function setToken(token) {
  if (token) {
    storage.setItem(JWT_KEY, token);
  } else {
    storage.removeItem(JWT_KEY);
  }
}
