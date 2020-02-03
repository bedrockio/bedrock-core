// This middleware is not currently being used however leaving it in as
// it is useful for a more SSR driven approach.
const COOKIE_NAME = 'hl';
const { LOCALES, DEFAULT_LOCALE_CODE } = require('../l10n/const');

module.exports = function l10nMiddleware(locales = LOCALES, defaultLocaleCode = DEFAULT_LOCALE_CODE) {

  const acceptedLocales = getAcceptedLocales();
  const languageMap     = getLanguageMap();
  const urlReg = RegExp(`^/(${acceptedLocales.join('|')})/`);

  function getAcceptedLocales() {
    return locales.map(l => l.lang || l.code);
  }

  function getLanguageMap() {
    return locales.reduce((map, l) => {
      if (l.lang) {
        map[l.lang] = l.code;
      }
      return map;
    }, {});
  }

  function getUrlLang(url) {
    const match = url.match(urlReg);
    return match ? match[1] : null;
  }

  function getFullLocale(code) {
    return code.length === 2 ? languageMap[code] : code;
  }

  function getLanguageFromHeaders(ctx) {
    return ctx.acceptsLanguages(acceptedLocales);
  }

  function getL10nUrls(url, hl) {
    const baseUrl = getBaseUrl(url, hl);
    return locales
      .map(l => {
        const canonical = l.code === defaultLocaleCode;
        const prefix = canonical ? '' : `/${l.lang || l.code}`;
        const url = `${prefix}${baseUrl}`;
        return {
          url: url,
          code: l.code,
          canonical: canonical
        };
      });
  }

  function getBaseUrl(url, hl) {
    return hl ? url.replace(urlReg, '/') : url;
  }

  function isDefaultLocale(code) {
    return !!code && getFullLocale(code) === defaultLocaleCode;
  }

  return (ctx, next) => {
    const urlLang = getUrlLang(ctx.path);
    let hl = urlLang;

    // The canonical url has no language prefix, so if one
    // is set then set the cookie and redirect to canonical.
    if (isDefaultLocale(hl)) {
        ctx.cookies.set(COOKIE_NAME, hl);
        ctx.redirect(getBaseUrl(ctx.url, hl));
    }
    // Otherwise redirect the user only if they don't explicitly
    // have a language set.
    else if (!hl) {

      // If the user has set a language preference in their cookies,
      // then use it, otherwise get from Accept-Language header and store.
      hl = ctx.cookies.get(COOKIE_NAME) || getLanguageFromHeaders(ctx);

      // If the requested language does not match the page,
      // then redirect them to it.
      if (!isDefaultLocale(hl)) {
        ctx.cookies.set(COOKIE_NAME, hl);
        ctx.redirect(`/${hl}${ctx.url}`);
        return;
      }
    }
    ctx.config.l10n = {
      hl: getFullLocale(hl),
      urls: getL10nUrls(ctx.url, hl),
      prefix: `/${urlLang || ''}`
    };
    return next();
  };
};
