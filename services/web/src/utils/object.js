import { mergeWith } from 'lodash-es';

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
