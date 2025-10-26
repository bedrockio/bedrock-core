import { localStorage, sessionStorage } from 'utils/storage';

export const JWT_KEY = 'jwt';

export function hasToken() {
  return !!getToken();
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
