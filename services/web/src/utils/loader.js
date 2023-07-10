import { useState, useMemo, useEffect } from 'react';
import { Dimmer, Loader } from 'semantic';

import ErrorBoundary from 'components/ErrorBoundary';

export function useLoader(fn, dependencies = []) {
  return useMemo(() => {
    return (props) => {
      const { inline, fallback, notFound, children } = props;

      const [error, setError] = useState();
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        load();
      }, dependencies);

      async function load() {
        try {
          setError(null);
          setLoading(true);
          await fn();
        } catch (error) {
          setError(error);
          throw error;
        } finally {
          setLoading(false);
        }
      }

      if (loading) {
        if (inline) {
          return <InlineLoader />;
        } else {
          return fallback || <DefaultLoader />;
        }
      }

      return (
        <ErrorBoundary error={error} notFound={notFound}>
          <Render>{children}</Render>
        </ErrorBoundary>
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

function DefaultLoader() {
  return (
    <Dimmer active inverted>
      <Loader inverted />
    </Dimmer>
  );
}

function InlineLoader() {
  return <Loader inline active />;
}
