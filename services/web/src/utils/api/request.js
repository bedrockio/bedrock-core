import { API_URL, API_KEY } from 'utils/env';
import { ApiError, ApiParseError } from './errors';
import { trackRequest } from '../analytics';
import { fetchWithTimeout } from '../fetch';
import { getToken } from './token';

export default async function request(options) {
  const { method = 'GET', path, files, params } = options;
  let { body } = options;

  const token = options.token || getToken();
  const headers = Object.assign(
    {
      Accept: 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      'API-Key': API_KEY,
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
    for (let [key, value] of Object.entries(body || {})) {
      data.append(key, value);
    }
    body = data;
  } else if (!(body instanceof FormData)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetchWithTimeout(url, {
    method,
    headers,
    body,
  });

  if (res.status === 204) {
    return;
  } else if (!res.ok) {
    let type = 'error';
    let message = res.statusText;
    let status = res.status;
    let details;
    try {
      const data = await res.clone().json();
      if (data.error) {
        type = data.error.type;
        message = data.error.message;
        status = data.error.status;
        details = data.error.details;
      }
    } catch (err) {
      message = await res.clone().text();
    }
    throw new ApiError(message, type, status, details);
  }

  try {
    const response = await res.json();
    trackRequest(options, response.data);
    return response;
  } catch (err) {
    throw new ApiParseError();
  }
}
