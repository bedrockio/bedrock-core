const request = require('supertest');
const rootApp = require('../../app');
const qs = require('querystring');
const { Blob } = require('node:buffer');
const { getAuthTokenPayload, signToken } = require('../auth/tokens');

module.exports = async function handleRequest(httpMethod, url, bodyOrQuery = {}, options = {}) {
  const headers = options.headers || {};
  if (options.user) {
    const { user } = options;

    const payload = getAuthTokenPayload(user);
    const token = signToken(payload);

    headers.Authorization = `Bearer ${token}`;
  } else if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.organization) {
    headers.organization = options.organization.id;
  }

  const app = options.app || rootApp;

  let promise;

  if (options.file) {
    const files = Array.isArray(options.file) ? options.file : [options.file];
    promise = request(app.callback()).post(url).set(headers);
    for (let file of files) {
      if (file instanceof Blob) {
        const buffer = Buffer.from(await file.arrayBuffer());
        promise = promise.attach('file', buffer, {
          contentType: file.type,
        });
      } else {
        promise = promise.attach('file', file);
      }
    }
    for (let [key, value] of Object.entries(bodyOrQuery)) {
      promise = promise.field(key, JSON.stringify(value));
    }
  } else {
    if (httpMethod === 'POST') {
      promise = request(app.callback())
        .post(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'PATCH') {
      promise = request(app.callback())
        .patch(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'PUT') {
      promise = request(app.callback())
        .put(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'DELETE') {
      promise = request(app.callback())
        .del(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'GET') {
      promise = request(app.callback())
        .get(`${url}?${qs.stringify({ ...bodyOrQuery })}`)
        .set(headers);
    } else {
      throw new Error(`${httpMethod} is not supported`);
    }
  }

  if (promise) {
    return promise;
  }

  if (httpMethod === 'PUT') {
    throw new Error('Use PATCH instead of PUT the api support PATCH not PUT');
  }
  throw new Error(`Method not support ${httpMethod} by handleRequest`);
};
