import { getCurrentLocaleCode } from './client';
import { DEFAULT_LOCALE_CODE } from './const';

export default function getLocalized(arg) {
  let str;
  if (!arg) {
    str = '';
  } else if (typeof arg === 'string') {
    str = arg;
  } else if (arg) {
    const obj = arg;
    const code = getCurrentLocaleCode(false);
    str = obj[code];
    if (str == null && code !== DEFAULT_LOCALE_CODE) {
      str = obj[DEFAULT_LOCALE_CODE];
    }
  }
  return str;
}
