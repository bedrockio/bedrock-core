
export function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export const truncate = (text, limit = 100) => {
  if (text.length > limit - 3) {
    return text.slice(0, limit - 3) + '...';
  }
  return text;
};
