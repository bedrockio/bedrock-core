import { useLocation, useParams } from '@bedrockio/router';
import { Loader } from '@mantine/core';
import { createContext, useContext, useEffect, useState } from 'react';

import ErrorMessage from 'components/ErrorMessage';

export const PageContext = createContext();

export function PageProvider(props) {
  return (
    <PageContext.Provider value={{}}>{props.children}</PageContext.Provider>
  );
}

export function usePage() {
  return useContext(PageContext);
}

export function usePageLoader(fn) {
  return useParamsLoader('id', fn);
}

export function useParamsLoader(arg, fn) {
  const names = Array.isArray(arg) ? arg : [arg];
  return useLoader(names, useParams(), fn);
}

export function useQueryLoader(arg, fn) {
  const names = Array.isArray(arg) ? arg : [arg];
  return useLoader(names, useSearchParams(), fn);
}

function useLoader(names, params, fn) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [state, setState] = useState({});

  const parent = usePage();

  const deps = names.map((name) => {
    return params[name];
  });

  useEffect(() => {
    loadPage();
  }, deps);

  async function loadPage() {
    setLoading(true);
    setError(null);
    try {
      const newState = await fn(params);
      setState({
        ...state,
        ...newState,
      });
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function PageLoader(props) {
    const { fallback, notFound } = props;
    if (loading) {
      return fallback || <Loader />;
    } else if (error) {
      if (error.status === 404 && notFound) {
        return notFound;
      } else {
        return <ErrorMessage error={error} />;
      }
    }

    return (
      <PageContext.Provider
        value={{
          ...parent,
          ...state,
          reload: loadPage,
        }}>
        {props.children}
      </PageContext.Provider>
    );
  }

  return PageLoader;
}

// Note that this hook is included in React Router v6 but not v5,
// so including it here.
function useSearchParams() {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
}
