import { DateTime } from 'luxon';

export function formatDate(arg) {
  let date;
  if (typeof arg === 'string') {
    date = DateTime.fromISO(arg);
  } else {
    date = DateTime.fromJSDate(arg);
  }
  return date.toLocaleString(DateTime.DATETIME_MED);
}
