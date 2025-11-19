import { useState } from 'react';

import { request } from 'utils/api';

export function useRequest(arg) {
  const { handler, getInitial, onSuccess, onError, onAbort, controller } =
    resolveOptions(arg);

  const [error, setError] = useState(null);
  const [result, setResult] = useState(getInitial?.());
  const [loading, setLoading] = useState(false);

  async function run(...args) {
    setError(null);
    setLoading(true);

    try {
      const result = await handler(...args);
      setLoading(false);
      setResult(result);
      onSuccess?.(result);
    } catch (error) {
      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }

  function abort() {
    controller.abort();
    onAbort?.();
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
