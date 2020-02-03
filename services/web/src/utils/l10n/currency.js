import { getCurrentLocaleCode } from './client';

export function formatCurrency(val, forceTwoDigit = false, currency = 'USD') {
  if (currency === 'USD') {
    val /= 100;
  }
  const formatter = new Intl.NumberFormat(getCurrentLocaleCode(), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: forceTwoDigit || !Number.isInteger(val) ? 2 : 0
  });
  return formatter.format(val);
}
