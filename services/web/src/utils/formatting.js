export function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export const truncate = (text, limit = 100) => {
  if (text.length > limit - 3) {
    return text.slice(0, limit - 3) + '...';
  }
  return text;
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const numberWithDots = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

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
