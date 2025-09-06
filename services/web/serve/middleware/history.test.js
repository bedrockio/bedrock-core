import Koa from 'koa';
import httpMocks from 'node-mocks-http';
import { describe, expect, it } from 'vitest';

import history from './history';

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
    httpMocks.createResponse(mockRes),
  );
  // Something internal to the http module breaks if we don't set this.
  ctx.cookies = new FakeCookies(mockReq.cookies);

  return ctx;
}

const middleware = history({ apps: ['/', '/admin/'] });

function run(url, subdomain = 'www') {
  let nextCalled = false;
  const ctx = createFakeKoaContext({
    url: url,
    subdomains: [subdomain],
  });
  middleware(ctx, () => (nextCalled = true));

  return {
    ctx,
    nextCalled,
  };
}

describe('History Middleware', () => {
  describe('/', () => {
    it('should not rewrite /', () => {
      const { ctx } = run('/');
      expect(ctx.url).toBe('/');
      expect(ctx.status).toBe(200);
    });

    it('should not redirect empty string', () => {
      const { ctx } = run('');
      expect(ctx.url).toBe('');
      expect(ctx.status).toBe(200);
    });

    it('should rewrite /page', () => {
      const { ctx } = run('/page');
      expect(ctx.url).toBe('/');
      expect(ctx.status).toBe(200);
    });

    it('should rewrite /page/subpage', () => {
      const { ctx } = run('/page/subpage');
      expect(ctx.url).toBe('/');
      expect(ctx.status).toBe(200);
    });
  });

  describe('/admin/', () => {
    it('should not rewrite /admin/', () => {
      const { ctx } = run('/admin/');
      expect(ctx.url).toBe('/admin/');
      expect(ctx.status).toBe(200);
    });

    it('should redirect /admin', () => {
      const { ctx, nextCalled } = run('/admin');
      expect(ctx.url).toBe('/admin');
      expect(ctx.status).toBe(301);
      expect(ctx.response.header.location).toBe('/admin/');
      expect(nextCalled).toBe(false);
    });

    it('should rewrite /admin/page', () => {
      const { ctx } = run('/admin/page');
      expect(ctx.url).toBe('/admin/');
      expect(ctx.status).toBe(200);
    });

    it('should rewrite /adminx to root', () => {
      const { ctx } = run('/adminx');
      expect(ctx.url).toBe('/');
      expect(ctx.status).toBe(200);
    });
  });
});
