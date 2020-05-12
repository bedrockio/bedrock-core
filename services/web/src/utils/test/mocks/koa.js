const Koa = require('koa');
const httpMocks = require('node-mocks-http');

const app = new Koa();

class FakeCookies {

  constructor(data = {}) {
    this.data = data;
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
  }

}

function createFakeKoaContext(mockReq = {}, mockRes = {}) {

  // Koa checks this so assign as mock value
  Object.assign(mockReq, { socket: {} });

  const ctx = app.createContext(
    httpMocks.createRequest(mockReq),
    httpMocks.createResponse(mockRes)
  );

  // Something internal to the http module breaks if we don't set this.
  ctx.cookies = new FakeCookies(mockReq.cookies);

  return ctx;
}

module.exports = {
  createFakeKoaContext
};

