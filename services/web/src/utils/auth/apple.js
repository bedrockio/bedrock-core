/* global AppleID */

import { once } from 'lodash';

import { request } from 'utils/api';
import { loadScript } from 'utils/script';
import { APPLE_SERVICE_ID, APPLE_RETURN_URL } from 'utils/env';

const SCRIPT_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

export function canShowAppleSignin() {
  return !!APPLE_SERVICE_ID;
}

export async function signInWithApple() {
  assertReturnDomain();
  await initialize();
  let response;
  try {
    response = await AppleID.auth.signIn();
  } catch (object) {
    if (object.error === 'popup_closed_by_user') {
      return;
    } else {
      throw new Error(object.error);
    }
  }

  const { id_token: token } = response.authorization;
  const { firstName, lastName } = response.user?.name || {};

  const { data } = await request({
    method: 'POST',
    path: '/1/auth/apple',
    body: {
      token,
      firstName,
      lastName,
    },
  });

  return data;
}

export async function disable() {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/apple/disable',
  });
  return data;
}

function assertReturnDomain() {
  const { hostname: host } = new URL(APPLE_RETURN_URL);
  if (host !== location.hostname) {
    throw new Error('Apple return URL must match hostname.');
  }
}

const initialize = once(async () => {
  await loadScript(SCRIPT_URL);
  AppleID.auth.init({
    state: 'initial',
    scope: 'name email',
    clientId: APPLE_SERVICE_ID,
    redirectURI: APPLE_RETURN_URL,
    usePopup: true,
  });
});
