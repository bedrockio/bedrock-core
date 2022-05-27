import { APP_NAME } from 'utils/env';
import { snakeCase } from 'lodash';

export const JWT_KEY = `${snakeCase(APP_NAME)}_jwt`;

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
