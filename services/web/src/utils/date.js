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

export function formatDate(arg, locale) {
  return getFormatted(arg, locale, DATE_MED);
}

export function formatDateTime(arg, locale) {
  return getFormatted(arg, locale, DATETIME_MED);
}

function getFormatted(arg, locale, options) {
  const date = typeof arg === 'string' ? new Date(arg) : arg;
  return new Intl.DateTimeFormat(locale, options).format(date);
}
