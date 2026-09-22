import { useParams } from '@bedrockio/router';
import { createContext, useCallback, use, useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';

import ErrorMessage from 'components/ErrorMessage';

export const PageContext = createContext();

export function usePage() {
  return use(PageContext);
}

export function usePageLoader(fn) {
  return useParamsLoader('id', fn);
}

function useParamsLoader(arg, fn) {
  const names = Array.isArray(arg) ? arg : [arg];
  return useLoader(names, useParams(), fn);
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

  function update(newState) {
    setState({
      ...state,
      ...newState,
    });
  }

  const PageLoader = useCallback(
    (props) => {
      const { fallback, notFound } = props;
      if (loading) {
        return (
          fallback || (
            <div className="flex justify-center p-8">
              <Spinner className="size-6" />
            </div>
          )
        );
      } else if (error) {
        if (error.status === 404 && notFound) {
          return notFound;
        } else {
          return <ErrorMessage error={error} />;
        }
      }

      return (
        <PageContext
          value={{
            ...parent,
            ...state,
            update,
            reload: loadPage,
          }}>
          {props.children}
        </PageContext>
      );
    },
    [loading, error],
  );

  return PageLoader;
}
