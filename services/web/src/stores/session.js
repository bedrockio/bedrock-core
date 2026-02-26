import { withRouter } from '@bedrockio/router';
import { omit } from 'lodash';

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { trackSession } from 'utils/analytics';
import { hasToken, request, setToken } from 'utils/api';
import { wrapContext } from 'utils/hoc';
import { merge } from 'utils/object';
import { getOrganization, setOrganization } from 'utils/organization';
import { userHasAccess } from 'utils/permissions';
import { captureError } from 'utils/sentry';
import { localStorage } from 'utils/storage';

const SessionContext = React.createContext();

function SessionProvider({ children, location }) {
  const loadStoredData = () => {
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
  };

  const [state, setState] = useState({
    user: null,
    error: null,
    ready: false,
    loading: true,
    organization: null,
    stored: loadStoredData(),
    isLoggingIn: false,
    meta: null,
  });

  const prevLocationRef = useRef(location);

  // Helper function to update state partially
  const updateState = useCallback((newState) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const isAdmin = useCallback(() => {
    return hasRoles(['admin']);
  }, []);

  const hasRoles = useCallback(
    (roles = []) => {
      return roles.some((role) => {
        return state.user?.roles.includes(role);
      });
    },
    [state.user],
  );

  const hasRole = useCallback(
    (role) => {
      return hasRoles([role]);
    },
    [hasRoles],
  );

  const hasAccess = useCallback(
    ({ endpoint, permission, scope }) => {
      return userHasAccess(state.user, {
        endpoint,
        permission,
        scope: scope || 'organization',
        scopeRef: state.organization?.id,
      });
    },
    [state.user, state.organization],
  );

  const loadOrganization = useCallback(async () => {
    const organization = getOrganization();
    if (organization) {
      try {
        const { data } = await request({
          method: 'GET',
          path: `/1/organizations/${organization}`,
        });
        return data;
      } catch (err) {
        if (err.status < 500) {
          setOrganization(null);
        }
      }
    }
    return null;
  }, []);

  const bootstrap = useCallback(async () => {
    if (hasToken()) {
      updateState({
        loading: true,
        error: null,
      });
      try {
        const { data: user } = await request({
          method: 'GET',
          path: '/1/users/me',
        });

        const { data: meta } = await request({
          method: 'GET',
          path: '/1/meta',
        });
        const organization = await loadOrganization();

        // Uncomment this line if you want to set up
        // User-Id tracking. https://bit.ly/2DKQYEN.
        // setUserId(user.id);

        updateState({
          user,
          meta,
          organization,
          loading: false,
          ready: true,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        captureError(error);
        if (error.type === 'token') {
          await logout();
        } else {
          updateState({
            error,
            loading: false,
            ready: true,
          });
        }
      }
    } else {
      updateState({
        user: null,
        ready: true,
        loading: false,
      });
    }
  }, [loadOrganization]);

  const updateUser = useCallback(
    (data) => {
      updateState({
        user: merge(state.user, data),
      });
    },
    [state.user, updateState],
  );

  const clearUser = useCallback(() => {
    updateState({
      user: null,
      error: null,
    });
  }, [updateState]);

  // Authentication
  const login = useCallback(async (body) => {
    updateState({
      isLoggingIn: true,
    });
    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/password/login',
        body,
      });
      const redirect = await authenticate(data.token);
      updateState({
        isLoggingIn: false,
      });
      return redirect;
    } catch (error) {
      updateState({
        error,
        isLoggingIn: false,
      });
      throw error;
    }
  }, []);

  const popRedirect = useCallback(() => {
    const url = localStorage.getItem('redirect');
    localStorage.removeItem('redirect');
    return url;
  }, []);

  const pushRedirect = useCallback(() => {
    const { pathname, search } = window.location;
    const url = pathname + search;
    if (url !== '/') {
      localStorage.setItem('redirect', url);
    }
  }, []);

  const logout = useCallback(
    async (redirect) => {
      if (redirect) {
        pushRedirect();
      }

      if (hasToken()) {
        updateState({
          loading: true,
          error: null,
        });
        try {
          await request({
            method: 'POST',
            path: '/1/auth/logout',
          });
        } finally {
          // Note: User may have a bad token which will throw
          // errors on the logout call. We need to swallow these
          // and not set them so that the app can proceed back
          // to an unauthenticated state.
          setToken(null);
          updateState({
            user: null,
            ready: true,
            loading: false,
          });
        }
      }
    },
    [pushRedirect],
  );

  const authenticate = useCallback(
    async (token) => {
      setToken(token);
      await bootstrap();
      return popRedirect() || '/';
    },
    [bootstrap, popRedirect],
  );

  const isLoggedIn = useCallback(() => {
    return hasToken() && !state.isLoggingIn;
  }, [state.isLoggingIn]);

  // Session storage methods
  const updateStored = useCallback(
    (data) => {
      if (Object.keys(data).length > 0) {
        localStorage.setItem('session', JSON.stringify(data));
      } else {
        localStorage.removeItem('session');
      }
      updateState({
        stored: data,
      });
    },
    [updateState],
  );

  const setStored = useCallback(
    (key, data) => {
      updateStored(
        merge({}, state.stored, {
          [key]: data,
        }),
      );
      trackSession('add', key, data);
    },
    [state.stored, updateStored],
  );

  const removeStored = useCallback(
    (key) => {
      updateStored(omit(state.stored, key));
      trackSession('remove', key);
    },
    [state.stored, updateStored],
  );

  const clearStored = useCallback(() => {
    updateStored({});
  }, [updateStored]);

  const popStored = useCallback(
    (key) => {
      const stored = state.stored[key];
      if (stored) {
        removeStored(key);
        return stored;
      }
      return undefined;
    },
    [state.stored, removeStored],
  );

  // Handle location change
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      updateState({ error: null });
      prevLocationRef.current = location;
    }
  }, [location, updateState]);

  // ComponentDidMount equivalent
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const contextValue = {
    ...state,
    bootstrap,
    setStored,
    removeStored,
    clearStored,
    updateUser,
    clearUser,
    login,
    isLoggedIn,
    authenticate,
    logout,
    hasRoles,
    hasRole,
    hasAccess,
    isAdmin,
    pushRedirect,
    popStored,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

const Provider = withRouter(SessionProvider);

export { Provider as SessionProvider };

export function useSession() {
  return useContext(SessionContext);
}

export const withSession = wrapContext(SessionContext);
