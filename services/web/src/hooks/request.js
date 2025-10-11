import { useState } from 'react';

import { request } from 'utils/api';

export function useRequest(arg) {
  const options = resolveOptions(arg);

  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run(...args) {
    setError(null);
    setLoading(true);

    try {
      const result = await options.handler(...args);
      setLoading(false);
      setResult(result);
      options.onSuccess?.(result);
    } catch (error) {
      setError(error);
      setLoading(false);
      options.onError?.(error);
    }
  }

  function abort() {
    options.controller.abort();
    options.onAbort?.();
  }

  return {
    run,
    abort,
    error,
    result,
    loading,
  };
}

function resolveOptions(arg) {
  let options;
  if (typeof arg === 'function') {
    options = { handler: arg };
  } else if (arg.path) {
    options = {
      handler: () => {
        return request({
          ...arg,
          controller: options.controller,
        });
      },
    };
  } else {
    options = { ...arg };
  }

  options.controller ||= new AbortController();
  return options;
}
