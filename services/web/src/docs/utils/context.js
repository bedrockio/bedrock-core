import React, { useState, useEffect, useContext } from 'react';
import { set } from 'lodash';

import { isRecording, toggleRecording } from 'utils/api/record';

import { request } from 'utils/api';

export const DocsContext = React.createContext({});

export function DocsProvider(props) {
  const [mode, setMode] = useState('view');
  const [docs, setDocs] = useState(null);
  const [recording, setRecording] = useState(isRecording());
  const [loading, setLoading] = useState(false);

  const visitedComponents = new Set();

  function updateDocs(options) {
    const { path, value } = options;
    const updated = {
      ...docs,
    };
    set(updated, path, value);
    setDocs(updated);
  }

  useEffect(async () => {
    setLoading(true);
    const { data } = await request({
      method: 'GET',
      path: '/1/docs',
    });
    setDocs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    toggleRecording(recording);
  }, [recording]);

  return (
    <DocsContext.Provider
      value={{
        mode,
        docs,
        setDocs,
        setMode,
        updateDocs,
        loading,
        recording,
        setRecording,
        visitedComponents,
      }}>
      {props.children}
    </DocsContext.Provider>
  );
}

export function useDocs() {
  return useContext(DocsContext);
}
