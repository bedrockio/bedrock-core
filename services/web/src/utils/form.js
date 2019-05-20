import { capitalize } from 'lodash';

export const simpleOptions = (keys) =>
  keys.map((key) => {
    return {
      key,
      value: key,
      text: capitalize(key)
    };
  });
