// Returns a Content-Language header based on
// a simple URL prefix structure for languages.
//
// Usage:
//
// app.use(contentLanguage(['en-US', 'ja-JP'], 'en-US'))
//
// Examples:
//
// URL          Content-Language
// -----------------------------
// /            en-US
// /page        en-US
// /ja          en-US
// /ja/page     ja-JP
// /ja-JP/page  ja-JP
//

const DEFAULT_CODE = 'en-US';

module.exports = function contentLanguageMiddleware(localeCodes, defaultCode) {

  localeCodes = localeCodes || [DEFAULT_CODE];
  defaultCode = defaultCode || DEFAULT_CODE;

  const map = {};

  for (let code of localeCodes) {
    map[code] = code;
    map[code.slice(0, 2)] = code;
  }

  const reg = RegExp(`^/(${Object.keys(map).join('|')})/`);

  return (ctx, next) => {
    const match = ctx.url.match(reg);
    let code;
    if (match) {
      code = map[match[1]];
    } else {
      code = defaultCode;
    }
    ctx.append('Content-Language', code);
    return next();
  };
};
