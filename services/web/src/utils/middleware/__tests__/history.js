import history from '../history';

const middleware = history({ apps: ['/', '/admin/'] });

function run(url, subdomain = 'www') {
  let aborted = true;
  let redirect = null;
  const ctx = {
    url,
    status: 200,
    subdomains: [subdomain],
    redirect: (url) => {
      redirect = url;
    }
  }
  middleware(ctx, () => {
    aborted = false;
  });
  return {
    url: ctx.url,
    status: ctx.status,
    aborted,
    redirect,
  }
}

describe('History Middleware', () => {

  describe('/', () => {
    it('should not rewrite /', () => {
      const { url, status } = run('/');
      expect(url).toBe('/');
      expect(status).toBe(200);
    });

    it('should not redirect empty string', () => {
      const { url, status } = run('');
      expect(url).toBe('');
      expect(status).toBe(200);
    });

    it('should rewrite /page', () => {
      const { url, status } = run('/page');
      expect(url).toBe('/');
      expect(status).toBe(200);
    });

    it('should rewrite /page/subpage', () => {
      const { url, status } = run('/page/subpage');
      expect(url).toBe('/');
      expect(status).toBe(200);
    });
  });

  describe('/admin/', () => {

    it('should not rewrite /admin/', () => {
      const { url, status } = run('/admin/');
      expect(url).toBe('/admin/');
      expect(status).toBe(200);
    });

    it('should redirect /admin', () => {
      const { url, status, aborted, redirect } = run('/admin');
      expect(url).toBe('/admin');
      expect(status).toBe(301);
      expect(redirect).toBe('/admin/');
      expect(aborted).toBe(true);
    });

    it('should rewrite /admin/page', () => {
      const { url, status } = run('/admin/page');
      expect(url).toBe('/admin/');
      expect(status).toBe(200);
    });

    it('should rewrite /adminx to root', () => {
      const { url, status } = run('/adminx');
      expect(url).toBe('/');
      expect(status).toBe(200);
    });

  });


});
