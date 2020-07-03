import { API_URL } from 'utils/env';
import { session } from 'stores';

import { ApiError, ApiParseError } from './errors';

export default async function request(options) {
  const { method = 'GET', path, files, params } = options;
  let { body } = options;

  const token = options.token || session.token;

  const headers = Object.assign(
    {
      Accept: 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    options.headers
  );

  const url = new URL(path, API_URL);
  url.search = new URLSearchParams(params);

  if (files) {
    const data = new FormData();
    files.forEach((file) => {
      data.append('file', file);
    });
    body = data;
  } else if (!(body instanceof FormData)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  if (res.status === 204) {
    return;
  } else if (!res.ok) {
    let message, statusCode;
    try {
      const data = await res.clone().json();
      if (data.error) {
        message = data.error.message;
        statusCode = data.error.statusCode;
      }
    } catch(err) {
      message = await res.clone().text();
    }
    throw new ApiError(message || res.statusText, statusCode || res.status);
  }

  try {
    return await res.json();
  } catch (err) {
    throw new ApiParseError();
  }
}
