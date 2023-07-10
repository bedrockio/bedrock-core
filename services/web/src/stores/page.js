import React, { useState, useContext, useMemo } from 'react';

import { useLoader } from 'utils/loader';
import { wrapContext } from 'utils/hoc';

const Context = React.createContext();

export function usePageLoader(fn, dependencies = []) {
  return useMemo(() => {
    return (props) => {
      const page = usePage();
      const [data, setData] = useState();
      const [count, setCount] = useState(0);

      const Loader = useLoader(async () => {
        setData(await fn());
      }, [count, ...dependencies]);

      function reload() {
        setCount(count + 1);
      }

      return (
        <Context.Provider
          value={{
            ...page,
            ...data,
            reload,
            reloadPage: page?.reload || reload,
          }}>
          <Loader {...props} />
        </Context.Provider>
      );
    };
  }, dependencies);
}

export function usePage() {
  return useContext(Context);
}

export const withPage = wrapContext(Context);
