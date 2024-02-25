import { API_KEY, API_URL } from 'utils/env';

import { trackRequest } from '../analytics';
import { fetchWithTimeout } from '../fetch';
import { ApiError, ApiParseError } from './errors';
import { stringifyParams } from './params';
import { isRecording } from './record';
import { getToken } from './token';

export default async function request(options) {
  const { method = 'GET', path, files, params, record } = options;
  let { body } = options;

  const token = options.token || getToken();

  const headers = Object.assign(
    {
      Accept: 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...((record || isRecording()) && {
        'Api-Record': 'on',
      }),
      'API-Key': API_KEY,
    },
    options.headers
  );

  const url = new URL(path, API_URL);

  if (params) {
    url.search = stringifyParams(params);
  }

  if (files) {
    const data = new FormData();
    files.forEach((file) => {
      data.append('file', file);
    });
    for (let [key, value] of Object.entries(body || {})) {
      data.append(key, JSON.stringify(value));
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
  }

  if (
    ['text/csv', 'application/pdf'].includes(res.headers.get('Content-type'))
  ) {
    return res.blob().then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const filename = res.headers
        .get('Content-Disposition')
        ?.split(';')[1]
        .replace('filename=', '')
        .replace(/"/g, '');

      a.download = filename?.trim() || 'export.csv';
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove();
      return null;
    });
  }

  if (!res.ok) {
    let type = 'error';
    let message = res.statusText;
    let status = res.status;
    let response;
    try {
      response = await res.clone().json();
      if (response.error) {
        type = response.error.type;
        message = response.error.message;
        status = response.error.status;
      }
    } catch (err) {
      message = await res.clone().text();
    }
    throw new ApiError(message, type, status, response);
  }

  try {
    const response = await res.json();
    trackRequest(options, response.data);
    return response;
  } catch (err) {
    throw new ApiParseError();
  }
}
