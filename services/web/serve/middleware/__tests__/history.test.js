import history from '../history';
const { createFakeKoaContext } = require('koa');

jest.mock('koa');

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
