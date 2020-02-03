import { setPath } from 'utils/test/mocks/location';
import {
  getCurrentLocaleCode,
  getLocaleName,
  getUrlBase,
  getUrls
} from '../client';

jest.mock('../const', () => {
  return {
    get DEFAULT_LOCALE_CODE () {
      return 'en-US';
    },
    get LOCALES () {
      return [
        {
          name: 'English',
          code: 'en-US',
          lang: 'en'
        },
        {
          name: '日本語',
          code: 'ja-JP',
          lang: 'ja'
        },
        {
          name: 'português (Brasil)',
          code: 'pt-BR'
        }
      ];
    }
  };
});

describe('L10N Clientside', () => {

  describe('getCurrentLocaleCode canonical', () => {

    it('should correctly default to en', () => {
      setPath('/page');
      expect(getCurrentLocaleCode()).toBe('en');
    });

    it('should correctly find ja from ja path', () => {
      setPath('/ja/page');
      expect(getCurrentLocaleCode()).toBe('ja');
    });

    it('should correctly find pt-BR from full path', () => {
      setPath('/pt-BR/page');
      expect(getCurrentLocaleCode()).toBe('pt-BR');
    });

    it('should not find fr-CA', () => {
      setPath('/fr-CA/page');
      expect(getCurrentLocaleCode()).toBeNull();
    });

  });

  describe('getCurrentLocaleCode non-canonical', () => {

    it('should correctly default to en-US', () => {
      setPath('/page');
      expect(getCurrentLocaleCode(false)).toBe('en-US');
    });

    it('should correctly find ja-JP from ja path', () => {
      setPath('/ja/page');
      expect(getCurrentLocaleCode(false)).toBe('ja-JP');
    });

    it('should correctly find pt-BR from full path', () => {
      setPath('/pt-BR/page');
      expect(getCurrentLocaleCode(false)).toBe('pt-BR');
    });

    it('should not find fr-CA', () => {
      setPath('/fr-CA/page');
      expect(getCurrentLocaleCode()).toBeNull();
    });

  });

  describe('getUrlBase', () => {

    it('should correctly get canonical prefix', () => {
      setPath('/page');
      expect(getUrlBase()).toBe('/');
    });

    it('should correctly get a language prefix', () => {
      setPath('/ja/page');
      expect(getUrlBase()).toBe('/ja');
    });

    it('should correctly get a supported locale prefix', () => {
      setPath('/pt-BR/page');
      expect(getUrlBase()).toBe('/pt-BR');
    });

    it('should not get an unsupported locale prefix', () => {
      setPath('/fr-CA/page');
      expect(getUrlBase()).toBe('/');
    });

    it('should allow a basename', () => {
      setPath('/example/ja/page');
      expect(getUrlBase('/example')).toBe('/example/ja');
    });

  });

  describe('getLocaleName', () => {

    it('should correctly name for language', () => {
      expect(getLocaleName('en')).toBe('English');
    });

    it('should correctly name for locale', () => {
      expect(getLocaleName('pt-BR')).toBe('português (Brasil)');
    });

    it('should not get name for locale that only supports regional code', () => {
      expect(getLocaleName('pt')).toBeNull();
    });

    it('should not get name for unsupported locale', () => {
      expect(getLocaleName('fr-CA')).toBeNull();
    });

  });

  describe('getUrls', () => {

    it('should get correct language switch urls', () => {
      setPath('/page');
      expect(getUrls()).toEqual([
        {
          url: '/page',
          code: 'en-US',
          canonical: true
        },
        {
          url: '/ja/page',
          code: 'ja-JP',
          canonical: false
        },
        {
          url: '/pt-BR/page',
          code: 'pt-BR',
          canonical: false
        }
      ]);
    });

    it('should get correct language switch urls for non-canonical page', () => {
      setPath('/ja/page');
      expect(getUrls()).toEqual([
        {
          url: '/page',
          code: 'en-US',
          canonical: true
        },
        {
          url: '/ja/page',
          code: 'ja-JP',
          canonical: false
        },
        {
          url: '/pt-BR/page',
          code: 'pt-BR',
          canonical: false
        }
      ]);
    });

  });

});
