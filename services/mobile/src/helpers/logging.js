import { helpers } from 'app';

export const log = (...args) => {
  if (!helpers.isProduction) console.log(...args);
};
