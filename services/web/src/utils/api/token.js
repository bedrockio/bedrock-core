import { APP_NAME } from 'utils/env';
import { snakeCase } from 'lodash';

export const JWT_KEY = `${snakeCase(APP_NAME)}_jwt`;

export function hasToken() {
  return !!getToken();
}

let searchParams = new URLSearchParams(window.location.search);

// doing this little dance to tranfer the token without having it appear in the url
if (searchParams.get('tmpToken')) {
  const tmpToken = localStorage.getItem('tmpToken');
  localStorage.removeItem('tmpToken');
  sessionStorage.setItem(JWT_KEY, tmpToken);
}

export function getToken() {
  return sessionStorage.getItem(JWT_KEY) || localStorage.getItem(JWT_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(JWT_KEY, token);
  } else {
    localStorage.removeItem(JWT_KEY);
  }
}
