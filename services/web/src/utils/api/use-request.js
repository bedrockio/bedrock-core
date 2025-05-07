import { useCallback, useEffect, useRef, useState } from 'react';

import requestFn from './request';

export default function useRequest({
  manual = false,
  defaultData = [],
  onSuccess = () => {},
  onError = () => {},
  ...options
}) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controller = useRef(null);

  const request = useCallback(
    (args) => {
      const requestArgs = { ...options, ...args };
      if (!requestArgs.path) {
        return;
      }

      if (controller.current) {
        controller.current.abort();
      }

      controller.current = new AbortController();

      setLoading(true);

      return requestFn({ signal: controller.current.signal, ...requestArgs })
        .then(async (res) => {
          console.log('Request completed:', res);
          await onSuccess(res);
          setResponse(res);
          setLoading(false);

          return res;
        })
        .catch(async (err) => {
          await onError(err);
          setLoading(false);

          if (err.name !== 'AbortError') {
            setError(err);
          }

          return err;
        });
    },
    [options.path, options.body, options.params],
  );

  const abort = useCallback(() => {
    if (controller.current) {
      controller.current?.abort('');
    }
  }, []);

  useEffect(() => {
    if (!manual) {
      request();
    }

    return () => {
      if (controller.current) {
        controller.current.abort('');
      }
    };
  }, [options.path, manual]);

  return {
    response,
    data: response?.data || defaultData,
    loading,
    error,
    request,
    abort,
  };
}
