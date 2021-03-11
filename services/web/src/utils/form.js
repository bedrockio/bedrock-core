import { capitalize } from 'lodash';

export const simpleOptions = (keys) =>
  keys.map((key) => {
    return {
      key,
      value: key,
      text: capitalize(key),
    };
  });

export const createOptions = (keys) => {
  return Object.keys(keys).map((key) => {
    return {
      key,
      text: keys[key].name,
      icon: keys[key].icon,
      value: key,
    };
  });
};
