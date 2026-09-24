import React, { use, useEffect, useState } from 'react';

import { request } from 'utils/api';

export const DocsContext = React.createContext({});

export function DocsProvider(props) {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(false);

  const visitedComponents = new Set();

  async function loadDocs() {
    setLoading(true);
    const { data } = await request({
      method: 'GET',
      path: '/openapi.json',
    });
    setDocs(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <DocsContext
      value={{
        docs,
        loading,
        visitedComponents,
      }}>
      {props.children}
    </DocsContext>
  );
}

export function useDocs() {
  return use(DocsContext);
}
