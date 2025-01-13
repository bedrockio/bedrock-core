const DATE_MED = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const DATETIME_MED = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

export function formatDate(arg, options) {
  if (arguments.length > 0 && arg == null) {
    return null;
  }
  return getFormatted(arg, {
    ...DATE_MED,
    ...options,
  });
}

export function formatDateCompact(arg, locale) {
  // MM/DD/YYYY
  const date = typeof arg === 'string' ? new Date(arg) : arg;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateTime(arg, options) {
  return getFormatted(arg, {
    ...DATETIME_MED,
    ...options,
  });
}

export function formatTime(arg, options) {
  return getFormatted(arg, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options,
  });
}

function getFormatted(arg, options = {}) {
  const { locale, ...rest } = options;
  const date = typeof arg === 'string' ? new Date(arg) : arg;
  return new Intl.DateTimeFormat(locale, rest).format(date);
}

export function fromNow(
  date,
  nowDate = Date.now(),
  rft = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
) {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  const intervals = [
    { ge: YEAR, divisor: YEAR, unit: 'year' },
    { ge: MONTH, divisor: MONTH, unit: 'month' },
    { ge: WEEK, divisor: WEEK, unit: 'week' },
    { ge: DAY, divisor: DAY, unit: 'day' },
    { ge: HOUR, divisor: HOUR, unit: 'hour' },
    { ge: MINUTE, divisor: MINUTE, unit: 'minute' },
    { ge: 30 * SECOND, divisor: SECOND, unit: 'seconds' },
    { ge: 0, divisor: 1, text: 'just now' },
  ];

  const now =
    typeof nowDate === 'object'
      ? nowDate.getTime()
      : new Date(nowDate).getTime();

  const diff =
    now - (typeof date === 'object' ? date : new Date(date)).getTime();

  const diffAbs = Math.abs(diff);

  for (const interval of intervals) {
    if (diffAbs >= interval.ge) {
      const x = Math.round(Math.abs(diff) / interval.divisor);
      const isFuture = diff < 0;
      return interval.unit
        ? rft.format(isFuture ? x : -x, interval.unit)
        : interval.text;
    }
  }
}
