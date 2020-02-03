import qsStringify from './query-stringify';
import config from 'config';
import appSession from 'stores/AppSession';

export default function request(options) {
  const { path, method, body, params, token, file } = Object.assign(
    {
      method: 'GET',
      token: appSession.token
    },
    options
  );

  const headers = Object.assign(
    {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    options.headers || {}
  );

  const paramsPath = Object.keys(params || {}).length
    ? `?${qsStringify(params)}`
    : '';
  const endpoint = `${config.API_URL.replace(/\/$/, '')}/${path.replace(
    /^\//,
    ''
  )}${paramsPath}`;
  if (token) headers.Authorization = `Bearer ${token}`;
  let promise;
  if (method.toUpperCase() === 'GET') {
    promise = fetch(endpoint, { headers });
  } else {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      delete headers['Content-Type'];
      promise = fetch(endpoint, {
        method,
        headers,
        body: formData
      });
    } else {
      promise = fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(body)
      });
    }
  }

  return promise.then((res) => {
    if (res.status === 204) return;

    return res.text().then((response) => {
      let json;
      try {
        json = JSON.parse(response);
      } catch (e) {
        throw new Error('Bad JSON response from API');
      }
      if (!json) throw new Error('Null JSON response from API');
      const { error } = json;
      if (error) {
        const err = new Error(error.message);
        err.status = res.status;
        throw err;
      }
      return json;
    });
  });
}
