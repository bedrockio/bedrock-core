// TODO: This is probably more suited to a plugin.

// Handles localization via a cookie or URL prefix.
//
// For default URLs with no prefix, this middleware
// will check the "hl" cookie or the browser's
// Accept-Language header. If a language matches
// that is not the default language, then they will
// be redirected to the page with the appropriate
// prefix.
//
// For URLs with a prefix, if the prefix is the
// default language then they will be redirected
// to the canonical page without it, otherwise
// they will be allowed on.
//
// This middleware will also set an "l10n" object on
// the state containing contextual information about
// the current language as well as canonical URLs for
// the current page for use with meta tags.
//
// Note that this middleware intentionally does not
// concern itself with actually setting the cookie
// but instead allows this to be handled by either
// Javascript or another middleware (via a param).
//
// Usage:
//
// app.use(l10n(['en-US', 'ja-JP'], 'en-US'))
//
// Examples:
//
//           Request                 |     Response
// ----------------------------------|-------------------
// URL       Cookie  Accept-Language |  URL       Status
// ----------------------------------|-------------------
// /page     none    en,ja;q=0.9     |  /page     200
// /page     none    ja,en;q=0.9     |  /ja/page  301
// /page     ja      en,ja;q=0.9     |  /ja/page  301
// /en/page  none    en,ja;q=0.9     |  /page     301
// /ja/page  none    en,ja;q=0.9     |  /ja/page  200
// /ja/page  none    ja,en;q=0.9     |  /ja/page  200
// /ja/page  en      en,ja;q=0.9     |  /ja/page  200
//
//

const COOKIE_NAME = 'hl';
const DEFAULT_CODE = 'en-US';

module.exports = function l10nMiddleware(localeCodes, defaultCode) {

  localeCodes = localeCodes || [DEFAULT_CODE];
  defaultCode = defaultCode || DEFAULT_CODE;

  const map = {};

  for (let code of localeCodes) {
    map[code] = code;
    map[code.slice(0, 2)] = code;
  }

  const acceptedLocales = Object.keys(map);

  const reg = RegExp(`^/(${acceptedLocales.join('|')})/`);

  function getUrlLang(url) {
    const match = url.match(reg);
    return match ? match[1] : null;
  }

  function getL10nUrls(url, hl) {
    const baseUrl = getBaseUrl(url, hl);
    return localeCodes
      .map((code) => {
        const { canonical, prefix } = getUrlPrefix(code);
        const url = `${prefix}${baseUrl}`;
        return {
          url,
          code,
          canonical,
        };
      });
  }

  function getUrlPrefix(code) {
    const canonical = code === defaultCode;
    const short = code.slice(0, 2);
    if (code.length > 2 && !localeCodes.includes(short)) {
      code = short;
    }
    const prefix = canonical ? '' : `/${code}`;
    return {
      canonical,
      prefix,
    };
  }

  function getBaseUrl(url, hl) {
    return hl ? url.replace(reg, '/') : url;
  }

  function isDefaultLocale(code) {
    return map[code] === defaultCode;
  }

  return (ctx, next) => {
    const urlLang = getUrlLang(ctx.path);
    let hl = urlLang;

    // The canonical url has no language prefix, so if one
    // is set then set the cookie and redirect to canonical.
    if (isDefaultLocale(hl)) {
      ctx.redirect(getBaseUrl(ctx.url, hl));
    }
    // Otherwise redirect the user only if they don't explicitly
    // have a language set.
    else if (!hl) {

      // If the user has set a language preference in their cookies,
      // then use it, otherwise get from Accept-Language header and store.
      hl = ctx.cookies.get(COOKIE_NAME) || ctx.acceptsLanguages(acceptedLocales);

      // If the requested language does not match the page,
      // then redirect them to it.
      if (!isDefaultLocale(hl)) {
        ctx.redirect(`/${hl}${ctx.url}`);
      }
    }
    ctx.state.l10n = {
      hl: map[hl],
      urls: getL10nUrls(ctx.url, hl),
      prefix: `/${urlLang || ''}`
    };
    return next();
  };
};
