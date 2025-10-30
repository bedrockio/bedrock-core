import { mapKeys } from 'lodash';

import { COUNTRIES } from './const';

const COUNTRIES_BY_PREFIX = mapKeys(COUNTRIES, (country) => {
  return country.prefix;
});

export function formatPhone(phone, countryCode) {
  if (!phone) {
    return '';
  }

  const country = countryCode
    ? COUNTRIES[countryCode]
    : getCountryByPrefix(phone);

  if (country) {
    const { prefix, format } = country;
    phone = phone.replace(prefix, '');
    phone = applyFormat(phone, format);
  }
  return phone;
}

export function getFormatLength(code) {
  const country = COUNTRIES[code];
  const digits = country.format.replace(/[^#]/g, '');
  return digits.length;
}

function getCountryByPrefix(phone) {
  let prefix = '';
  const len = Math.min(phone.length, 5);
  for (let i = 0; i < len; i++) {
    prefix += phone[i];
    const country = COUNTRIES_BY_PREFIX[prefix];
    if (country) {
      return country;
    }
  }
}

export function applyFormat(phone, format) {
  let str = '';
  let j = 0;
  for (let i = 0; i < format.length; i++) {
    const char = format[i];
    if (j >= phone.length) {
      break;
    }
    if (char === '#') {
      str += phone[j++];
    } else if (char === '0') {
      if (phone[j] !== '0') {
        str += char;
      }
    } else {
      str += char;
    }
  }
  return str;
}

export { COUNTRIES };
