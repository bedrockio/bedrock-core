import { helpers, constants } from 'app';

// User.
export const createUser = (data) =>
  postAndSaveAuthenticationToken('auth/register', data);

export const updateSelf = (data) => patch('users/me', data);

// Authentication.
export const createSession = (data) =>
  postAndSaveAuthenticationToken('auth/login', data);

// Items.
export const items = () => get('items');

// Requests.
const get = (path) => makeRequest(path, 'GET');

const post = (path, data) => makeRequest(path, 'POST', data);

const patch = (path, data) => makeRequest(path, 'PATCH', data);

const postAndSaveAuthenticationToken = async (path, data) => {
  const { token } = await post(path, data);

  await helpers.setAuthenticationToken(token);
};

const makeRequest = async (path, method, data = {}) => {
  const url = buildUrl(path);
  const token = await helpers.authenticationToken();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) options.headers.Authorization = `Bearer ${token}`;

  if (['POST', 'PATCH'].includes(method)) options.body = JSON.stringify(data);

  log('→', method, url, options);

  const response = await helpers.fetchJSON(url, options);

  log('←', method, url, response);

  if (response.error) throw `${response.error.message}.`;
  else return response.data;
};

const buildUrl = (path) => `${constants.apiBaseUrl}/1/${path}`;

export { buildUrl as url };

const log = (label, method, url, data) =>
  helpers.log(`${label} [${method}] ${url}`, data);
