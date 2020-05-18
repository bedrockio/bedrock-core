import { API_URL } from 'utils/env';
import session from 'stores/session';

import { ApiError, ApiParseError } from './errors';

export default async function request(options) {
  const { method = 'GET', path, params } = options;
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

  if (body instanceof File) {
    const data = new FormData();
    data.append('file', body);
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
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }

  try {
    return await res.json();
  } catch (err) {
    throw new ApiParseError();
  }
}
