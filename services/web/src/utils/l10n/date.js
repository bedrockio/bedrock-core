import { getCurrentLocaleCode } from './client';
import { DateTime, Info } from 'luxon';
import { memoize, range } from 'lodash';

// Note that all formatting methods here are for the purpose
// of the UI, and will be formatted as local dates. If strings
// are passed in they will be assumed to be from the API and
// parsed as local dates. See utils/helpers/api for more.

const SHORT_WITH_WEEKDAY = {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
  year: 'numeric',
};

const LONG_WITH_WEEKDAY = {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  year: 'numeric'
};

export function formatDate(date, format = DateTime.DATE_FULL) {
  if (typeof date === 'string') {
    // Anything in our API should only speak ISO dates. This includes
    // dates without time which Date.parse (or the native Date constructor)
    // will interpret as UTC, potentially shifting into another day. Using
    // the fromISO method will follow the ISO-8601 spec exactly, which is
    // what we want.
    date = DateTime.fromISO(date);
  } else {
    date = DateTime.fromJSDate(date);
  }
  return date
    .setLocale(getCurrentLocaleCode())
    .toLocaleString(format);
}

export function formatDateWithWeekday(date) {
  return formatDate(date, LONG_WITH_WEEKDAY);
}

export function formatDateShort(date) {
  return formatDate(date, SHORT_WITH_WEEKDAY);
}

// Fix for Luxon issue with ja-JP locale:
// https://github.com/moment/luxon/issues/54??9
export function getMonthsLong(localeCode = getCurrentLocaleCode()) {
  return getMonths(localeCode, 'long');
}

export function getWeekdaysShort(calendar, localeCode) {
  return getWeekdays('short', calendar, localeCode);
}

export function getWeekdaysLong(calendar, localeCode) {
  return getWeekdays('long', calendar, localeCode);
}

const getMonths = memoize(
  function(localeCode, type) {
    const formatter = new Intl.DateTimeFormat(localeCode, {
      month: type
    });
    return range(0, 12).map((_, i) => {
      return formatter.format(new Date(2019, i));
    });
  },
  (localeCode, type) => localeCode + type
);

function getWeekdays(
  type,
  calendar = false,
  localeCode = getCurrentLocaleCode()
) {
  let weekdays = Info.weekdays(type, { locale: localeCode });
  if (calendar) {
    // Weekdays for calendar start with Sunday so rotate the array here.
    weekdays = weekdays.concat();
    weekdays.unshift(weekdays.pop());
  }
  return weekdays;
}
