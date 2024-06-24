import { Label } from 'semantic-ui-react';

export { formatPhone } from './phone';

export function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export function truncate(text, limit = 100) {
  if (text.length > limit - 3) {
    return text.slice(0, limit - 3) + '...';
  }
  return text;
}

export function formatNumber(value, locale) {
  const formatter = new Intl.NumberFormat(locale);
  return formatter.format(value);
}

export function formatOption(types, key) {
  const status = types[key];
  const props = {
    content: status.name,
    icon: status.icon,
  };
  if (status.color) {
    props.color = status.color;
  }
  return <Label {...props} />;
}

export function formatAddress(address) {
  const components = [];
  if (address.line1) {
    components.push(address.line1);
  }
  if (address.city) {
    components.push(address.city);
  }
  if (address.stateOrProvince) {
    components.push(address.stateOrProvince);
  }
  if (address.countryCode) {
    components.push(address.countryCode);
  }
  return components.join(', ');
}

export function safeFileName(str) {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export function arrayToList(arr, fallback = 'None') {
  if (!arr?.length) {
    return fallback;
  }
  return (
    <ul>
      {arr.map((el, i) => {
        return <li key={i}>{el}</li>;
      })}
    </ul>
  );
}
