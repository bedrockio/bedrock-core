import React, { useState, useEffect, useContext } from 'react';

import { set, unset } from 'lodash';

import { ENV_NAME } from 'utils/env';

import { isRecording, toggleRecording } from 'utils/api/record';

import { request } from 'utils/api';

export const DocsContext = React.createContext({});

export function DocsProvider(props) {
  const [mode, setMode] = useState('view');
  const [docs, setDocs] = useState(null);
  const [recording, setRecording] = useState(isRecording());
  const [loading, setLoading] = useState(false);

  const visitedComponents = new Set();

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
      path: '/1/docs',
    });
    setDocs(data);
    setLoading(false);
  }

  async function generateDocs() {
    const { data } = await request({
      method: 'POST',
      path: '/1/docs/generate',
    });
    setDocs(data);
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
        updatePath,
        unsetPath,
        loadDocs,
        generateDocs,
        loading,
        recording,
        setRecording,
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
