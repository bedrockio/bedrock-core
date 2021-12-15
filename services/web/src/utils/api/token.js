import { APP_NAME } from 'utils/env';
import { camelCase } from 'lodash';

const KEY = `${camelCase(APP_NAME)}JWT`;

export function hasToken() {
  return !!getToken();
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(KEY, token);
  } else {
    localStorage.removeItem(KEY);
  }
}
