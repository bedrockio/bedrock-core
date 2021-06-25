const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export function formatUsd(val) {
  return formatCurrency(val, 'USD');
}

export function formatCurrency(val, currency, locale) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });
  return formatter.format(val);
}

export function getCurrencySymbol(currency) {
  return SYMBOLS[currency];
}
