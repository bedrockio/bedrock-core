import { useCallback, useEffect, useRef, useState } from 'react';

import request from './request';

export default function useRequest({
  autoInvoke = true,
  onSuccess = () => {},
  onError = () => {},
  ...options
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controller = useRef(null);

  const _request = useCallback(
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

      return request({ signal: controller.current.signal, ...requestArgs })
        .then(async (res) => {
          await onSuccess(res);
          setData(res);
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
    if (autoInvoke) {
      _request();
    }

    return () => {
      if (controller.current) {
        controller.current.abort('');
      }
    };
  }, [_request, autoInvoke]);

  return { data, loading, error, request: _request, abort };
}
