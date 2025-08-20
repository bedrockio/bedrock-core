/* global google */

import { once } from 'lodash';

import { request } from 'utils/api';
import { GOOGLE_CLIENT_ID } from 'utils/env';
import { loadScript } from 'utils/script';

const SCRIPT_URL = 'https://accounts.google.com/gsi/client?hl=en-US';

export function canShowGoogleSignin() {
  return !!GOOGLE_CLIENT_ID;
}

export async function signInWithGoogle() {
  await initialize();

  const response = await new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'profile email',
      callback: resolve,
      error_callback: (err) => {
        if (err.type === 'popup_closed') {
          resolve();
        } else {
          reject(new Error(err.message));
        }
      },
    });
    client.requestCode();
  });

  if (!response) {
    return;
  }

  const { code } = response;

  const { data } = await request({
    method: 'POST',
    path: '/1/auth/google',
    body: {
      code,
    },
  });
  return data;
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

const initialize = once(async () => {
  await loadScript(SCRIPT_URL);
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
  });
});
