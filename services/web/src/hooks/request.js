import { useState } from 'react';

import { request } from 'utils/api';

/**
 * Manages async request state with loading/error tracking.
 *
 * @overload
 * @param {RequestOptions} arg
 * @returns {RequestState}
 */
/**
 * @overload
 * @param {Function} arg
 * @returns {RequestState}
 */
/**
 * @param {Function|RequestOptions} arg
 * @returns {RequestState}
 */
export function useRequest(arg) {
  const options = resolveOptions(arg);

  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run(evt) {
    evt?.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await options.handler(options);
      setLoading(false);
      setResult(result);
      options.onSuccess?.(result);
    } catch (error) {
      setError(error);
      setLoading(false);
      options.onError?.();
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

/**
 * @typedef {Object} RequestOptions
 * @property {Function} [handler] - Async function to execute on run()
 * @property {string} [path] - API path (triggers automatic request() call)
 * @property {Function} [onSuccess] - Callback invoked with result on success
 * @property {Function} [onError] - Callback invoked on error
 * @property {Function} [onAbort] - Callback invoked on abort
 * @property {AbortController} [controller] - Custom AbortController instance
 */

/**
 * @typedef {Object} RequestState
 * @property {Function} run - Execute the request (can be used as form onSubmit)
 * @property {Function} abort - Abort the request
 * @property {Error|null} error - Error from last request
 * @property {*} result - Result from last successful request
 * @property {boolean} loading - Whether request is in progress
 */
