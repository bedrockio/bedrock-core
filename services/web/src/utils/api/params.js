import { isPlainObject } from 'lodash-es';

export function stringifyParams(map = {}) {
  const params = new URLSearchParams();
  for (let [key, value] of Object.entries(map)) {
    appendParams(params, key, value);
  }
  let str = params.toString();
  str = str.replace(/%5B/g, '[');
  str = str.replace(/%5D/g, ']');
  return str;
}

function appendParams(params, name, arg) {
  if (isPlainObject(arg)) {
    for (let [key, value] of Object.entries(arg)) {
      appendParams(params, `${name}[${key}]`, value);
    }
  } else if (Array.isArray(arg)) {
    for (let el of arg) {
      appendParams(params, name, el);
    }
  } else if (arg !== undefined) {
    params.append(name, arg);
  }
}
