/* global google */

import { loadScript } from 'utils/script';
import { GOOGLE_CLIENT_ID } from 'utils/env';
import { request } from 'utils/api';

const SCRIPT_URL = 'https://accounts.google.com/gsi/client?hl=en-US';

export async function initialize(callback) {
  await loadScript(SCRIPT_URL);
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback,
  });
}

export async function login(token) {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/google/login',
    body: {
      token,
    },
  });
  return data;
}

export async function enable(token) {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/google/enable',
    body: {
      token,
    },
  });
  return data;
}

export async function renderButton(el, options) {
  const { onAuthenticated: callback, ...rest } = options;
  await initialize(callback);
  google.accounts.id.renderButton(el, rest);
}

export async function disable(user) {
  await initialize();
  await new Promise((resolve) => {
    google.accounts.id.revoke(user.email, resolve);
  });

  const { data } = await request({
    method: 'POST',
    path: '/1/auth/google/disable',
  });

  return data;
}
