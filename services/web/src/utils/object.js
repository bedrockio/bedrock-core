import { mergeWith } from 'lodash';

// Merges while keeping arrays intact instead of
// trying to concat them together. Always returns
// a new object.
export function merge(target, ...sources) {
  return mergeWith({}, target, ...sources, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return srcValue;
    }
  });
}

export function stripEmpty(obj) {
  const result = {};
  for (let [key, value] of Object.entries(obj || {})) {
    if (value !== '' && value != null) {
      result[key] = value;
    }
  }
  return result;
}
