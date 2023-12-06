import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

import { request } from './api';

export async function signupWithPasskey(body) {
  const { data: options } = await request({
    method: 'POST',
    path: '/1/auth/passkey/register-generate',
    body,
  });
  const response = await register(options);
  return await request({
    method: 'POST',
    path: '/1/auth/passkey/register-verify',
    body: {
      email: body.email,
      response,
    },
  });
}

export async function loginWithPasskey(email) {
  const { data: options } = await request({
    method: 'POST',
    path: '/1/auth/passkey/login-generate',
    body: {
      email,
    },
  });
  const response = await authenticate(options);
  return await request({
    method: 'POST',
    path: '/1/auth/passkey/login-verify',
    body: {
      email,
      response,
    },
  });
}

export async function enablePasskey() {
  const { data: options } = await request({
    method: 'POST',
    path: '/1/auth/passkey/enable-generate',
  });
  const response = await register(options);
  return await request({
    method: 'POST',
    path: '/1/auth/passkey/enable-verify',
    body: {
      response,
    },
  });
}

export async function disablePasskey() {
  return await request({
    method: 'POST',
    path: '/1/auth/passkey/disable',
  });
}

async function register(options) {
  try {
    return await startRegistration(options);
  } catch (error) {
    if (error.code === 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY') {
      throw new Error('Operation was canceled or timed out.');
    }
    throw error;
  }
}

async function authenticate(options) {
  try {
    return await startAuthentication(options);
  } catch (error) {
    if (error.code === 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY') {
      throw new Error('Operation was canceled or timed out.');
    }
    throw error;
  }
}
