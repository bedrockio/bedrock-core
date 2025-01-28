import React, { useState, useEffect, useContext } from 'react';

import { set, unset } from 'lodash';

import { ENV_NAME } from 'utils/env';

import { request } from 'utils/api';

export const DocsContext = React.createContext({});

export function DocsProvider(props) {
  const [mode, setMode] = useState('view');
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(false);

  const visitedComponents = new Set();

  function toggleMode() {
    setMode(mode === 'edit' ? 'view ' : 'edit');
  }

  function setDocsPath(path, value) {
    const updated = { ...docs };
    set(updated, path, value);
    setDocs(updated);
  }

  function unsetDocsPath(path) {
    const updated = { ...docs };
    unset(updated, path);
    setDocs(updated);
  }

  function canEditDocs() {
    return ENV_NAME === 'development';
  }

  async function loadDocs() {
    setLoading(true);
    const { data } = await request({
      method: 'GET',
      path: '/openapi.json',
    });
    setDocs(data);
    setLoading(false);
  }

  async function generateDocs() {
    setLoading(true);
    const { data } = await request({
      method: 'POST',
      path: '/1/docs/generate',
    });
    setDocs(data);
    setLoading(false);
  }

  async function updatePath(path, value) {
    await updateRemotePath(path, value);
    setDocsPath(path, value);
  }

  async function unsetPath(path) {
    await updateRemotePath(path, null);
    unsetDocsPath(path);
  }

  async function updateRemotePath(path, value) {
    await request({
      method: 'PATCH',
      path: '/1/docs',
      body: {
        path,
        value,
      },
    });
  }

  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <DocsContext.Provider
      value={{
        mode,
        docs,
        setDocs,
        setMode,
        toggleMode,
        updatePath,
        unsetPath,
        loadDocs,
        generateDocs,
        loading,
        visitedComponents,
        canEditDocs,
      }}>
      {props.children}
    </DocsContext.Provider>
  );
}

export function useDocs() {
  return useContext(DocsContext);
}
