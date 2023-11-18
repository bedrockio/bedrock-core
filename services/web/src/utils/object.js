import { mergeWith } from 'lodash';

// Merges while keeping arrays intact
// instead of trying to concat them together.
export function merge(target, source) {
  return mergeWith({}, target, source, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return srcValue;
    }
  });
}
