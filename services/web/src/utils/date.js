import { DateTime } from 'luxon';

export function formatDate(arg) {
  return getFormatted(arg, DateTime.DATE_MED);
}

export function formatDateTime(arg) {
  return getFormatted(arg, DateTime.DATETIME_MED);
}

function getFormatted(arg, format) {
  let date;
  if (typeof arg === 'string') {
    date = DateTime.fromISO(arg);
  } else {
    date = DateTime.fromJSDate(arg);
  }
  return date.toLocaleString(format);
}
