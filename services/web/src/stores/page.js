import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useLocation, useParams } from '@bedrockio/router';
import { Loader } from 'semantic';

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
  const deps = names.map((name) => {
    return params[name];
  });

  const PageLoader = useCallback((props) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [state, setState] = useState({});

    const parent = usePage();

    useEffect(() => {
      loadPage();
    }, []);

    async function loadPage() {
      setLoading(true);
      setError(null);
      try {
        const newState = await fn(params);
        updatePage(newState);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    }

    function updatePage(newState) {
      setState({
        ...state,
        ...newState,
      });
    }

    const { fallback, notFound } = props;
    if (loading) {
      return fallback || <Loader active />;
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
          update: updatePage,
        }}>
        {props.children}
      </PageContext.Provider>
    );
  }, deps);

  return PageLoader;
}

// Note that this hook is included in React Router v6 but not v5,
// so including it here.
function useSearchParams() {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
}
