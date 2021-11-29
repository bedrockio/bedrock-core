import React from 'react';

const ConnectivityContext = React.createContext();

function ConnectivityProvider({ children }) {
  const [isOffline, setOffline] = React.useState(false);
  const [enabled, setEnabled] = React.useState(false);

  async function fetchWithTimeout(resource, options = {}) {
    const controller = new AbortController();
    const ref = setTimeout(() => controller.abort(), options.timeout);
    const response = await fetch(resource, {
      ...options,
      method: 'POST',
      signal: controller.signal,
    });
    if (response.status !== 204) {
      throw Error('Bad Status code');
    }
    clearTimeout(ref);
    return;
  }

  async function testConnection() {
    try {
      await fetchWithTimeout('/w/connectivity', {
        timeout: 1000,
      });
      setOffline(false);
    } catch (error) {
      setOffline(true);
    }
  }

  function handleDomOfflineEvent() {
    setOffline(true);
  }

  React.useEffect(() => {
    if (!enabled) return;

    window.addEventListener('offline', handleDomOfflineEvent);
    const interval = setInterval(
      () => {
        testConnection();
      },
      isOffline ? 20000 : 120000
    );
    return () => {
      clearInterval(interval);
      window.addEventListener('offline', handleDomOfflineEvent);
    };
  }, [isOffline, enabled]);

  const values = React.useMemo(() => {
    return {
      isOffline,
      setEnabled,
      enabled,
      testConnection,
    };
  }, [isOffline, setEnabled, enabled, testConnection]);

  return (
    <ConnectivityContext.Provider value={values}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export default {
  Provider: ConnectivityProvider,
  Context: ConnectivityContext,
};
