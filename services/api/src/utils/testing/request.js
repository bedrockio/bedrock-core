const request = require('supertest');
const rootApp = require('../../app');
const qs = require('querystring');
const { Blob } = require('node:buffer');
const { getAuthPayload, signToken } = require('../tokens');

module.exports = async function handleRequest(httpMethod, url, bodyOrQuery = {}, options = {}) {
  const headers = options.headers || {};
  if (options.user) {
    const { user } = options;

    const payload = getAuthPayload(user);
    const token = signToken(payload);

    headers.Authorization = `Bearer ${token}`;
  } else if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.organization) {
    headers.organization = options.organization.id;
  }

  const app = options.app || rootApp;

  let chain;

  if (options.file) {
    const files = Array.isArray(options.file) ? options.file : [options.file];
    chain = request(app.callback()).post(url).set(headers);
    for (let file of files) {
      if (file instanceof Blob) {
        const buffer = Buffer.from(await file.arrayBuffer());
        chain = chain.attach('file', buffer, {
          contentType: file.type,
        });
      } else {
        chain = chain.attach('file', file);
      }
    }
    for (let [key, value] of Object.entries(bodyOrQuery)) {
      chain = chain.field(key, JSON.stringify(value));
    }
  } else {
    if (httpMethod === 'POST') {
      chain = request(app.callback())
        .post(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'PATCH') {
      chain = request(app.callback())
        .patch(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'PUT') {
      chain = request(app.callback())
        .put(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'DELETE') {
      chain = request(app.callback())
        .del(url)
        .set(headers)
        .send({ ...bodyOrQuery });
    } else if (httpMethod === 'GET') {
      chain = request(app.callback())
        .get(`${url}?${qs.stringify({ ...bodyOrQuery })}`)
        .set(headers);
    } else {
      throw new Error(`${httpMethod} is not supported`);
    }
  }

  if (options.sse) {
    chain = chain.buffer(true).parse((res, cb) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => cb(null, data));
    });
  }

  return chain;
};
