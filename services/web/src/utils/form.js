import { capitalize } from 'lodash';

export const createDropdownOptions = (keys) => {
  if (keys.length && typeof keys[0] === 'string') {
    return keys.map((key) => {
      return {
        key,
        value: key,
        text: capitalize(key),
      };
    });
  }
  return Object.keys(keys).map((key) => {
    return {
      key,
      text: keys[key].name,
      icon: keys[key].icon,
      value: key,
    };
  });
};
