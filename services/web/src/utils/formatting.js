import React from 'react';

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

export const formatUsd = (value, precision = 2) => {
  if (isNaN(value)) return <span>&ndash;</span>;
  return <span>${(value / 100).toFixed(precision).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</span>;
};
