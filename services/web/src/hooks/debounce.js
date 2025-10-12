import { debounce } from 'lodash';
import { useCallback } from 'react';

export function useDebounce(...args) {
  const { run, timeout, deps } = resolveOptions(...args);
  return useCallback(debounce(run, timeout), deps);
}

function resolveOptions(...args) {
  if (args.length > 1) {
    return {
      run: args[0],
      timeout: args[1] || 300,
    };
  } else {
    return args[0];
  }
}
