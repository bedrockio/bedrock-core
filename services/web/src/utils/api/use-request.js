import { useCallback, useEffect, useRef, useState } from 'react';

export default function useRequest(url, { autoInvoke = true, ...options }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controller = useRef(null);

  const refetch = useCallback(() => {
    if (!url) {
      return;
    }

    if (controller.current) {
      controller.current.abort();
    }

    controller.current = new AbortController();

    setLoading(true);

    return request(url, { signal: controller.current.signal, ...options })
      .then((res) => {
        setData(res);
        setLoading(false);
        return res;
      })
      .catch((err) => {
        setLoading(false);

        if (err.name !== 'AbortError') {
          setError(err);
        }

        return err;
      });
  }, [url]);

  const abort = useCallback(() => {
    if (controller.current) {
      controller.current?.abort('');
    }
  }, []);

  useEffect(() => {
    if (autoInvoke) {
      refetch();
    }

    return () => {
      if (controller.current) {
        controller.current.abort('');
      }
    };
  }, [refetch, autoInvoke]);

  return { data, loading, error, refetch, abort };
}
