import { useCallback, useEffect, useRef, useState } from 'react';

import request from './request';

export default function useRequest({
  triggerOnMount = false,
  defaultData = [],
  onSuccess = () => {},
  onError = () => {},
  ...options
}) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const controller = useRef(null);

  const requestWrapped = useCallback(
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
      setSuccess(false);
      setError(null);

      return request({
        signal: controller.current.signal,
        ...requestArgs,
      })
        .then(async (res) => {
          await onSuccess(res);
          setResponse(res);
          setLoading(false);
          setSuccess(true);

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
    [options.path, options.params, options.body],
  );

  const abort = useCallback(() => {
    if (controller.current) {
      controller.current?.abort('');
    }
  }, []);

  useEffect(() => {
    if (triggerOnMount) {
      requestWrapped(options);
    }

    return () => {
      if (controller.current) {
        controller.current.abort('');
      }
    };
  }, [options.path]);

  return {
    response,
    data: response?.data || defaultData,
    loading,
    error,
    request: requestWrapped,
    abort,
    success,
  };
}
