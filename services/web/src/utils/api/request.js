import { API_KEY, API_URL } from 'utils/env';
import { getOrganization } from 'utils/organization';

import { trackRequest } from '../analytics';
import { fetchWithTimeout } from '../fetch';
import { ApiError, ApiParseError } from './errors';
import { stringifyParams } from './params';
import { getToken } from './token';

export default async function request(options) {
  Object.assign(options, getIncludes(options));

  const { method = 'GET', path, params, files } = options;

  let { body } = options;

  const url = new URL(path, API_URL);

  if (method === 'GET') {
    url.search = stringifyParams(params);
  }

  const headers = getHeaders(options);

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
  }

  const contentType = getContentType(res);

  let response = res;

  if (!res.ok) {
    let type = 'error';
    let message = res.statusText;
    let status = res.status;
    try {
      response = await response.clone().json();
      if (response.error) {
        type = response.error.type;
        message = response.error.message;
        status = response.error.status;
      }
    } catch {
      message = await res.clone().text();
    }
    throw new ApiError(message, type, status, response);
  }

  if (contentType === 'application/json') {
    try {
      response = await res.json();
      trackRequest(options, response);
    } catch {
      throw new ApiParseError();
    }
  }

  return response;
}

function getHeaders(options) {
  let { headers, token } = options;
  const organization = getOrganization();
  token ||= getToken();
  return {
    Accept: 'application/json',
    'Api-Key': API_KEY,
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
    ...(organization && {
      Organization: organization,
    }),
    ...headers,
  };
}

function getIncludes(options) {
  const { method = 'GET', params, body, include } = options;
  if (include && method === 'GET') {
    return {
      params: {
        ...params,
        include,
      },
    };
  } else if (include) {
    return {
      body: {
        ...body,
        include,
      },
    };
  }
}

function getContentType(res) {
  return res.headers.get('content-type').split(';')[0];
}
