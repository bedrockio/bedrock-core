import { mergeWith } from 'es-toolkit';

// Merges while keeping arrays intact instead of
// trying to concat them together. Always returns
// a new object.
export function merge(target, ...sources) {
  return [target, ...sources].reduce((result, source) => {
    return mergeWith(result, source || {}, (objValue, srcValue) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return srcValue;
      }
    });
  }, {});
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

// Paths are arrays or dot strings ("user.0.name").
function toPath(path) {
  return Array.isArray(path) ? path : String(path).split('.');
}

export function get(obj, path, defaultValue) {
  let value = obj;
  for (const key of toPath(path)) {
    value = value?.[key];
  }
  return value === undefined ? defaultValue : value;
}

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function set(obj, path, value) {
  const keys = toPath(path);
  if (!keys.length || keys.some((key) => UNSAFE_KEYS.has(key))) {
    return obj;
  }
  let current = obj;
  keys.slice(0, -1).forEach((key, i) => {
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    current = current[key];
  });
  current[keys.at(-1)] = value;
  return obj;
}

export function unset(obj, path) {
  const keys = toPath(path);
  const parent = get(obj, keys.slice(0, -1));
  if (parent && typeof parent === 'object') {
    delete parent[keys.at(-1)];
  }
}
