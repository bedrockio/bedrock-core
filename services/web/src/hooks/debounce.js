import { debounce } from 'lodash';
import { useCallback } from 'react';

const DEFAULT_TIMEOUT = 300;

export function useDebounce(...args) {
  const { run, timeout, deps = [] } = resolveOptions(...args);
  return useCallback(debounce(run, timeout), deps);
}

function resolveOptions(...args) {
  let options;
  if (args.length > 1) {
    options = {
      run: args[0],
      timeout: args[1],
    };
  } else if (typeof args[0] === 'function') {
    options = {
      run: args[0],
    };
  } else {
    options = args[0];
  }

  options.timeout ??= DEFAULT_TIMEOUT;

  return options;
}
