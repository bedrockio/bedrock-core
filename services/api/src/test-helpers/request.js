const request = require('supertest'); //eslint-disable-line
const app = require('../app');
const qs = require('querystring');
const fs = require('fs').promises;
const path = require('path');
const tokens = require('../lib/tokens');

module.exports = async function handleRequest(httpMethod, url, bodyOrQuery = {}, options = {}) {
  const headers = {};
  if (options.user) {
    headers.Authorization = `Bearer ${tokens.createUserToken(options.user)}`;
  }

  let promise;

  if (options.file) {
    const files = Array.isArray(options.file) ? options.file : [options.file];
    promise = request(app.callback())
      .post(url)
      .set(headers);
    files.forEach((file) => {
      promise = promise.attach('file', file)
    });
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
      throw Error(`${httpMethod} is not supported`);
    }
  }

  if (promise) {
    return promise;
  }

  if (httpMethod === 'PUT') {
    throw Error('Use PATCH instead of PUT the api support PATCH not PUT');
  }
  throw Error(`Method not support ${httpMethod} by handleRequest`);
};
