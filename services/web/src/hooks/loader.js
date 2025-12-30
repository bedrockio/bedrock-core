import { useEffect } from 'react';

import { useRequest } from './request';

export function useLoader(...args) {
  const { run, result, ...rest } = useRequest(...args);

  useEffect(() => {
    run();
  }, []);

  return {
    ...rest,
    ...result,
  };
}
