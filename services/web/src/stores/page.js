import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Dimmer, Loader } from 'semantic';

import { wrapContext } from 'utils/hoc';
import ErrorBoundary from 'components/ErrorBoundary';

const Context = React.createContext();

export function usePageLoader(fn, dependencies = []) {
  return useMemo(() => {
    return (props) => {
      const { inline, notFound, children } = props;

      const page = usePage();
      const [data, setData] = useState();
      const [error, setError] = useState();
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        load();
      }, []);

      async function load() {
        try {
          setError(null);
          setLoading(true);
          setData(await fn());
        } catch (error) {
          setError(error);
          throw error;
        } finally {
          setLoading(false);
        }
      }

      if (loading) {
        if (inline) {
          return <Loader active inline />;
        } else {
          return (
            <Dimmer active inverted>
              <Loader inverted inline />
            </Dimmer>
          );
        }
      }

      return (
        <Context.Provider
          value={{
            ...page,
            ...data,
            reload: load,
            reloadPage: page?.reload || load,
          }}>
          <ErrorBoundary error={error} notFound={notFound}>
            <Render>{children}</Render>
          </ErrorBoundary>
        </Context.Provider>
      );
    };
  }, dependencies);
}

// This component must be broken out to prevent an error with
// hooks order when using a render prop function.
function Render(props) {
  if (typeof props.children === 'function') {
    return props.children();
  } else {
    return props.children;
  }
}

export function usePage() {
  return useContext(Context);
}

export const withPage = wrapContext(Context);
