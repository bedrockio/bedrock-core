import { DateTime } from 'luxon';

export function formatDate(arg, locale) {
  return getFormatted(arg, DateTime.DATE_MED, locale);
}

export function formatDateTime(arg, locale) {
  return getFormatted(arg, DateTime.DATETIME_MED, locale);
}

function getFormatted(arg, format, locale) {
  let date;
  if (typeof arg === 'string') {
    date = DateTime.fromISO(arg);
  } else {
    date = DateTime.fromJSDate(arg);
  }
  return date.toLocaleString({
    locale,
    ...format,
  });
}
