import { DEFAULT_LOCALE_CODE, LOCALES } from './const';
import { location } from 'utils/helpers/window';

const PREFIX_REG = /^\/(\w{2}(?:-\w{2})?)\//;

// Note this will find the first match for "fr" even if other
// locales exist. Disambiguation can come later.
function getLocaleByCode(code) {
  return LOCALES.find(l => l.code === code || l.lang === code) || null;
}

function getLocaleCode(loc, canonical = true) {
  return canonical ? loc.lang || loc.code : loc.code;;
}

function getCurrentLocale(basename) {
  let path = location.pathname;
  if (basename) {
    path = path.replace(basename, '');
  }
  const match = path.match(PREFIX_REG);
  const code = match ? match[1] : DEFAULT_LOCALE_CODE;
  return getLocaleByCode(code);
}

export function isSupportedLocale(code) {
  return LOCALES.some(l => l.code === code);
};

export function getCurrentLocaleCode(canonical) {
  const loc = getCurrentLocale();
  return loc ? getLocaleCode(loc, canonical) : null;
}

export function getUrlBase(basename = '') {
  const loc = getCurrentLocale(basename);
  if (loc && loc.code !== DEFAULT_LOCALE_CODE) {
    basename += `/${getLocaleCode(loc)}`;
  } else {
    basename += '/';
  }
  return basename;
}

export function getLocaleName(code) {
  const loc = getLocaleByCode(code);
  return loc ? loc.name : null;
}

export function getUrls() {
  const basePath = location.pathname.replace(PREFIX_REG, '/');
  return LOCALES.map(l => {
    const canonical = l.code === DEFAULT_LOCALE_CODE;
    const prefix = canonical ? '' : `/${getLocaleCode(l)}`;
    const url = `${prefix}${basePath}${location.search}`;
    return {
      url: url,
      code: l.code,
      canonical: canonical
    };
  });
}
