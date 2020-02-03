const DEFAULT_LOCALE_CODE = 'en-US';

const LOCALES = [
  {
    name: 'English',
    code: 'en-US',
    lang: 'en'
  }
];

const LOCALE_MAP = LOCALES.reduce((map, locale) => {
  map[locale.lang] = locale;
  map[locale.code] = locale;
  return map;
}, {});

module.exports = {
  LOCALES,
  LOCALE_MAP,
  DEFAULT_LOCALE_CODE
};
