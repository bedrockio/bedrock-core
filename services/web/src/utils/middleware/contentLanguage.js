// Simple middleware to return a Content-Language header based on
// a simple URL prefix structure for languages.

const {
  LOCALES,
  LOCALE_MAP,
  DEFAULT_LOCALE_CODE
} = require('../l10n/const');

module.exports = function contentLanguageMiddleware() {
  const REG = RegExp(`^/(${LOCALES.map(l => l.lang).join('|')})`);
  return (ctx, next) => {
    const match = ctx.url.match(REG);
    let code;
    if (match) {
      code = LOCALE_MAP[match[1]].code;
    } else {
      code = DEFAULT_LOCALE_CODE;
    }
    ctx.append('Content-Language', code);
    return next();
  };
};
