/* global AppleID */

import { loadScript } from 'utils/script';
import { request } from 'utils/api';
import { APP_URL, APPLE_SERVICE_ID } from 'utils/env';

const SCRIPT_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

export function canShowAppleSignin() {
  return !!APPLE_SERVICE_ID;
}

export async function initialize() {
  await loadScript(SCRIPT_URL);
  AppleID.auth.init({
    state: 'initial',
    scope: 'name email',
    clientId: APPLE_SERVICE_ID,
    redirectURI: APP_URL,
    usePopup: true,
  });
}

export async function login(token) {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/apple/login',
    body: {
      token,
    },
  });
  return data;
}

export async function enable(token) {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/apple/enable',
    body: {
      token,
    },
  });
  return data;
}

export async function disable() {
  await initialize();
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/apple/disable',
  });

  return data;
}
