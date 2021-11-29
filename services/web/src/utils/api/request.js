import { API_URL } from 'utils/env';
import { ApiError, ApiParseError } from './errors';
import { trackRequest } from '../analytics';
import { getToken } from './token';

export default async function request(options) {
  const { method = 'GET', path, files, params, timeout = 20000 } = options;
  let { body } = options;

  const controller = new AbortController();
  const timeoutRef = setTimeout(() => controller.abort(), timeout);

  const token = options.token || getToken();

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
    for (let [key, value] of Object.entries(body || {})) {
      data.append(key, value);
    }
    body = data;
  } else if (!(body instanceof FormData)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Check your internet connection.');
    }
    throw err;
  }

  clearTimeout(timeoutRef);

  if (res.status === 204) {
    return;
  } else if (!res.ok) {
    let message, status, details;
    try {
      const data = await res.clone().json();
      if (data.error) {
        message = data.error.message;
        status = data.error.status;
        details = data.error.details;
      }
    } catch (err) {
      message = await res.clone().text();
    }
    throw new ApiError(
      message || res.statusText,
      status || res.status,
      details
    );
  }

  try {
    const response = await res.json();
    trackRequest(options, response.data);
    return response;
  } catch (err) {
    throw new ApiParseError();
  }
}
