import { APP_NAME } from 'utils/env';
import { snakeCase } from 'lodash';

export const JWT_KEY = `${snakeCase(APP_NAME)}_jwt`;

export function hasToken() {
  return !!getToken();
}

let searchParams = new URLSearchParams(window.location.search);

let storage = window.localStorage;

// doing this little dance to tranfer the token without having it appear in the url
if (searchParams.get('switch-account')) {
  const tmpToken = localStorage.getItem('tmpToken');
  sessionStorage.setItem(JWT_KEY, tmpToken);
  localStorage.removeItem('tmpToken');
  storage = window.sessionStorage;
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
