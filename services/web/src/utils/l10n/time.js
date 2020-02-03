import { DateTime } from 'luxon';
import { getCurrentLocaleCode } from './client';

// Luxon seems to have issues with ja-JP here.
// https://github.com/moment/luxon/issues/54??9
export function formatHours(arg) {
  if (arg == null) {
    throw new Error('Invalid hour');
  }
  let date;
  if (typeof arg === 'number') {
    date = new Date();
    date.setHours(arg);
  } else {
    date = arg;
  }
  return DateTime.fromJSDate(date).toFormat('ha').toLowerCase();
}

export function formatHourRange(from, to) {
  return `${formatHours(from)} - ${formatHours(to)}`;
}
