const l10nMiddleware = require('../l10n');
const { createFakeKoaContext } = require('koa');

jest.mock('koa');

const EN_PREFERRED = 'en,ja;q=0.9,en-US;q=0.8';
const JA_PREFERRED = 'ja,en;q=0.9,en-US;q=0.8';
const FR_CA_PREFERRED = 'fr-CA,fr;q=0.9,ja;q=0.8';

describe('L10N Middleware', () => {
  const middleware = l10nMiddleware(['en-US', 'ja-JP', 'fr', 'fr-CA'], 'en-US');

  function run(url, headers, code) {
    const ctx = createFakeKoaContext({
      url: url,
      headers: {
        'Accept-Language': headers,
      },
      cookies: {
        hl: code,
      },
    });
    middleware(ctx, () => {});
    return ctx;
  }

  function assertRedirected(ctx, code, query) {
    const prefix = code === 'en' ? '/' : `/${code}/`;
    expect(ctx.response.headers.location).toBe(
      `${prefix}page${query ? query : ''}`
    );
  }

  function assertNotRedirected(ctx) {
    expect(ctx.response.headers).not.toHaveProperty('location');
  }

  describe('redirects', () => {
    it('should not redirect when headers prefer default', () => {
      const ctx = run('/page', EN_PREFERRED);
      expect(ctx.state.l10n.hl).toBe('en-US');
      assertNotRedirected(ctx);
    });

    it('should not redirect explicit language is in URL', () => {
      const ctx = run('/ja/page', EN_PREFERRED);
      expect(ctx.state.l10n.hl).toBe('ja-JP');
      assertNotRedirected(ctx);
    });

    it('should not redirect explicit language is in URL even when cookie is set', () => {
      const ctx = run('/ja/page', EN_PREFERRED, 'en');
      expect(ctx.state.l10n.hl).toBe('ja-JP');
      assertNotRedirected(ctx, 'en');
    });

    it('should redirect when headers do not prefer default', () => {
      const ctx = run('/page', JA_PREFERRED);
      assertRedirected(ctx, 'ja');
    });

    it('should preserve query params when redirecting', () => {
      const ctx = run('/page?foo=bar', JA_PREFERRED);
      assertRedirected(ctx, 'ja', '?foo=bar');
    });

    it('should not redirect when cookie is overriding back to default', () => {
      const ctx = run('/page', JA_PREFERRED, 'en');
      expect(ctx.state.l10n.hl).toBe('en-US');
      assertNotRedirected(ctx, 'en');
    });

    it('should redirect when cookie is overriding default', () => {
      const ctx = run('/page', EN_PREFERRED, 'ja');
      assertRedirected(ctx, 'ja');
    });

    it('should redirect when headers prefer full locale code', () => {
      const ctx = run('/page', FR_CA_PREFERRED);
      assertRedirected(ctx, 'fr-CA');
    });

    it('should redirect from explicit to canonical', () => {
      const ctx = run('/en/page', EN_PREFERRED);
      assertRedirected(ctx, 'en');
    });
  });

  describe('l10n urls', () => {
    it('should correctly set l10n urls', () => {
      const ctx = run('/page', EN_PREFERRED);
      expect(ctx.state.l10n).toEqual({
        hl: 'en-US',
        prefix: '/',
        urls: [
          {
            code: 'en-US',
            url: '/page',
            canonical: true,
          },
          {
            code: 'ja-JP',
            url: '/ja/page',
            canonical: false,
          },
          {
            code: 'fr',
            url: '/fr/page',
            canonical: false,
          },
          {
            code: 'fr-CA',
            url: '/fr-CA/page',
            canonical: false,
          },
        ],
      });
    });

    it('should correctly set l10n urls for non-canonical pages', () => {
      const ctx = run('/fr-CA/page', EN_PREFERRED);
      expect(ctx.state.l10n).toEqual({
        hl: 'fr-CA',
        prefix: '/fr-CA',
        urls: [
          {
            code: 'en-US',
            url: '/page',
            canonical: true,
          },
          {
            code: 'ja-JP',
            url: '/ja/page',
            canonical: false,
          },
          {
            code: 'fr',
            url: '/fr/page',
            canonical: false,
          },
          {
            code: 'fr-CA',
            url: '/fr-CA/page',
            canonical: false,
          },
        ],
      });
    });

    it('should correctly set l10n urls with query params', () => {
      const ctx = run('/page?foo=bar', EN_PREFERRED);
      expect(ctx.state.l10n).toEqual({
        hl: 'en-US',
        prefix: '/',
        urls: [
          {
            code: 'en-US',
            url: '/page?foo=bar',
            canonical: true,
          },
          {
            code: 'ja-JP',
            url: '/ja/page?foo=bar',
            canonical: false,
          },
          {
            code: 'fr',
            url: '/fr/page?foo=bar',
            canonical: false,
          },
          {
            code: 'fr-CA',
            url: '/fr-CA/page?foo=bar',
            canonical: false,
          },
        ],
      });
    });
  });
});
