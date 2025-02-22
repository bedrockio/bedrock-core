import React, { createContext, useContext, useEffect, useState } from 'react';

import { localStorage, sessionStorage } from 'utils/storage';
import { request } from 'utils/api';

const SessionContext = createContext(undefined);

function loadStored() {
  let data;
  try {
    const str = localStorage.getItem('session');
    if (str) {
      data = JSON.parse(str);
    }
  } catch {
    localStorage.removeItem('session');
  }
  return data || {};
}

export const SessionProvider = ({ children }) => {
  const [state, setState] =
    useState <
    SessionState >
    {
      user: undefined,
      error: null,
      ready: false,
      loading: true,
      organization: null,
      stored: loadStored(),
    };

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    const hasToken = !!getToken();

    if (hasToken) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data: user } =
          (await request) < User > { method: 'GET', path: '/1/users/me' };

        console.log(user);

        setState((prevState) => ({
          ...prevState,
          user: user,
          //organization,
          loading: false,
          ready: true,
          //stored: state.stored
        }));
      } catch (error) {
        //captureError(error);
        if (error.type === 'token') {
          //await logout(true);
        } else {
          setState((prev) => ({ ...prev, error, loading: false, ready: true }));
        }
      }
    } else {
      setState((prev) => ({
        ...prev,
        user: undefined,
        ready: true,
        loading: false,
      }));
    }
  }

  /*
  async function loadOrganization(): Promise<Organization | null> {
    const organizationId = getOrganization();
    if (organizationId) {
      try {
        const { data } = await request<Organization>({ method: 'GET', path: `/1/organizations/${organizationId}` });
        return data;
      } catch (err) {
        if (err.status < 500) setOrganization(null);
      }
    }
    return null;
  }
  */

  function updateUser(user) {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...user,
      },
    }));
  }

  /*
  async function logout(redirect = false) {
    if (redirect) pushRedirect();
    if (hasToken()) {
      try {
        await request({ method: 'POST', path: '/1/auth/logout' });
      } catch {}
      setToken(null);
    }
    await bootstrap();
    history.push(popRedirect() || '/');
  }
  */

  async function authenticate(token) {
    setToken(token);
    await bootstrap();
    return popRedirect() || '/dashboard';
  }

  function hasRole(role) {
    if (!state.user?.role) {
      return false;
    }
    return state.user?.role?.id === role;
  }

  function pushRedirect() {
    const { pathname, search } = window.location;
    const url = pathname + search;
    if (url !== '/') sessionStorage.setItem('redirect', url);
  }

  function popRedirect() {
    const url = sessionStorage.getItem('redirect');
    sessionStorage.removeItem('redirect');
    return url;
  }

  function setStored(key, data) {
    const newStored = { ...state.stored, [key]: data };
    localStorage.setItem('session', JSON.stringify(newStored));
    setState((prev) => ({ ...prev, stored: newStored }));
  }

  function removeStored(key) {
    const newStored = { ...state.stored };
    delete newStored[key];
    localStorage.setItem('session', JSON.stringify(newStored));
    setState((prev) => ({ ...prev, stored: newStored }));
  }

  function clearStored() {
    localStorage.removeItem('session');
    setState((prev) => ({ ...prev, stored: {} }));
  }

  function clearUser() {
    setState((prev) => ({ ...prev, user: undefined }));
  }

  async function logout(redirect = false) {
    if (redirect) pushRedirect();
    if (getToken()) {
      try {
        await request({ method: 'POST', path: '/1/auth/logout' });
      } catch {}
      setToken(null);
    }
    await bootstrap();
    window.location.href = '/';
  }

  return (
    <SessionContext.Provider
      value={{
        ...state,
        bootstrap,
        updateUser,
        logout,
        authenticate,
        isLoggedIn: () => !!getToken(),
        hasRole,
        pushRedirect,
        setStored,
        removeStored,
        clearStored,
        clearUser,
      }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error('useSession must be used within a SessionProvider');
  return context;
}
