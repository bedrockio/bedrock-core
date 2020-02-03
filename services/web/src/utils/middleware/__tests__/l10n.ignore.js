const l10nMiddleware = require('../l10n');
const { createFakeKoaContext } = require('utils/test/mocks/koa');

const EN_PREFERRED = 'en,ja;q=0.9,en-US;q=0.8';
const JA_PREFERRED = 'ja,en;q=0.9,en-US;q=0.8';
const FR_CA_PREFERRED = 'fr-CA,fr;q=0.9,ja;q=0.8';

describe('L10N Middleware', () => {

  const middleware = l10nMiddleware([
    { code: 'en-US', lang: 'en' },
    { code: 'ja-JP', lang: 'ja' },
    { code: 'fr-CA' }
  ], 'en-US');

  function setupContext(url, headers, code) {
    const ctx = createFakeKoaContext({
      url: url,
      headers: {
        'Accept-Language': headers
      },
      cookies: {
        hl: code
      }
    });
    ctx.config = {};
    middleware(ctx, () => {});
    return ctx;
  }

  function assertRedirected(ctx, code, query) {
    const prefix = code === 'en' ? '/' : `/${code}/`;
    expect(ctx.response.headers.location).toBe(`${prefix}page${query ? query : ''}`);
    assertCookieSet(ctx, code);
  }

  function assertNotRedirected(ctx, cookie) {
    expect(ctx.response.headers).not.toHaveProperty('location');
    assertCookieSet(ctx, cookie);
  }

  function assertCookieSet(ctx, code) {
    expect(ctx.cookies.get('hl')).toBe(code);
  }

  describe('redirects', () => {

    it('should not redirect when headers prefer default', () => {
      const ctx = setupContext('/page', EN_PREFERRED);
      expect(ctx.config.l10n.hl).toBe('en-US');
      assertNotRedirected(ctx);
    });

    it('should not redirect explicit language is in URL', () => {
      const ctx = setupContext('/ja/page', EN_PREFERRED);
      expect(ctx.config.l10n.hl).toBe('ja-JP');
      assertNotRedirected(ctx);
    });

    it('should not redirect explicit language is in URL even when cookie is set', () => {
      const ctx = setupContext('/ja/page', EN_PREFERRED, 'en');
      expect(ctx.config.l10n.hl).toBe('ja-JP');
      assertNotRedirected(ctx, 'en');
    });

    it('should redirect when headers do not prefer default', () => {
      const ctx = setupContext('/page', JA_PREFERRED);
      assertRedirected(ctx, 'ja');
    });

    it('should preserve query params when redirecting', () => {
      const ctx = setupContext('/page?foo=bar', JA_PREFERRED);
      assertRedirected(ctx, 'ja', '?foo=bar');
    });

    it('should not redirect when cookie is overriding back to default', () => {
      const ctx = setupContext('/page', JA_PREFERRED, 'en');
      expect(ctx.config.l10n.hl).toBe('en-US');
      assertNotRedirected(ctx, 'en');
    });

    it('should redirect when cookie is overriding default', () => {
      const ctx = setupContext('/page', EN_PREFERRED, 'ja');
      assertRedirected(ctx, 'ja');
    });

    it('should redirect when headers prefer full locale code', () => {
      const ctx = setupContext('/page', FR_CA_PREFERRED);
      assertRedirected(ctx, 'fr-CA');
    });

    it('should redirect from explicit to canonical', () => {
      const ctx = setupContext('/en/page', EN_PREFERRED);
      assertRedirected(ctx, 'en');
    });

  });

  describe('l10n urls', () => {

    it('should correctly set l10n urls in the config', () => {
      const ctx = setupContext('/page', EN_PREFERRED);
      expect(ctx.config.l10n).toEqual({
        hl: 'en-US',
        prefix: '/',
        urls: [
          {
            code: 'en-US',
            url: '/page',
            canonical: true
          },
          {
           code: 'ja-JP',
            url: '/ja/page',
            canonical: false
          },
          {
           code: 'fr-CA',
            url: '/fr-CA/page',
            canonical: false
          }
        ]
      });
    });

    it('should correctly set l10n urls for non-canonical pages', () => {
      const ctx = setupContext('/fr-CA/page', EN_PREFERRED);
      expect(ctx.config.l10n).toEqual({
        hl: 'fr-CA',
        prefix: '/fr-CA',
        urls: [
          {
           code: 'en-US',
            url: '/page',
            canonical: true
          },
          {
           code: 'ja-JP',
            url: '/ja/page',
            canonical: false
          },
          {
           code: 'fr-CA',
            url: '/fr-CA/page',
            canonical: false
          }
        ]
      });
    });

    it('should correctly set l10n urls with query params', () => {
      const ctx = setupContext('/page?foo=bar', EN_PREFERRED);
      expect(ctx.config.l10n).toEqual({
        hl: 'en-US',
        prefix: '/',
        urls: [
          {
           code: 'en-US',
            url: '/page?foo=bar',
            canonical: true
          },
          {
           code: 'ja-JP',
            url: '/ja/page?foo=bar',
            canonical: false
          },
          {
           code: 'fr-CA',
            url: '/fr-CA/page?foo=bar',
            canonical: false
          }
        ]
      });
    });

  });
});
