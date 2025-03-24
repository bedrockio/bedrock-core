import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

import { AUTH_PASSKEY } from 'utils/env';

import { request } from '../api';

const DIALOG_ERRORS = ['ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY'];

export function canShowPasskey() {
  return !!AUTH_PASSKEY;
}

export async function login() {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/passkey/generate-login',
  });
  const { token, options } = data;
  const response = await authenticate(options);
  if (!response) {
    return;
  }
  const { data: result } = await request({
    method: 'POST',
    path: '/1/auth/passkey/verify-login',
    body: {
      token,
      response,
    },
  });
  return result;
}

export async function createPasskey() {
  const { data } = await request({
    method: 'POST',
    path: '/1/auth/passkey/generate-new',
  });
  const { token, options } = data;
  const response = await register(options);
  if (!response) {
    return;
  }
  return await request({
    method: 'POST',
    path: '/1/auth/passkey/verify-new',
    body: {
      token,
      response,
    },
  });
}

export async function removePasskey(passkey) {
  const { id } = passkey;
  return await request({
    method: 'DELETE',
    path: `/1/auth/passkey/${id}`,
  });
}

async function register(options) {
  try {
    return await startRegistration({
      optionsJSON: options,
      useAutoRegister: true,
    });
  } catch (error) {
    const { code } = error;
    if (code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED') {
      throw new Error('This passkey has already been registered.');
    } else if (code === 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY') {
      return;
    }
    throw error;
  }
}

async function authenticate(options) {
  try {
    return await startAuthentication({
      optionsJSON: options,
    });
  } catch (error) {
    if (!DIALOG_ERRORS.includes(error.code)) {
      throw error;
    }
  }
}
