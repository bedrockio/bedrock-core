import React, { useContext } from 'react';
import { withRouter } from '@bedrockio/router';
import { omit } from 'lodash';

import { request, hasToken, setToken } from 'utils/api';
import { getOrganization, setOrganization } from 'utils/organization';
import { trackSession } from 'utils/analytics';
import { captureError } from 'utils/sentry';
import { wrapContext } from 'utils/hoc';
import { localStorage } from 'utils/storage';
import { merge } from 'utils/object';

const SessionContext = React.createContext();

@withRouter
export class SessionProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      ready: false,
      loading: true,
      organization: null,
      stored: this.loadStored(),
    };
  }

  componentDidMount() {
    this.bootstrap();
  }

  componentDidUpdate(lastProps) {
    this.checkHistoryChange(lastProps);
  }

  componentDidCatch(error) {
    captureError(error);
    this.setState({
      error,
    });
  }

  isAdmin = () => {
    return this.hasRoles(['admin']);
  };

  hasRoles = (roles = []) => {
    const { user } = this.state;
    return roles.some((role) => {
      return user?.roles.includes(role);
    });
  };

  hasRole = (role) => {
    return this.hasRoles([role]);
  };

  bootstrap = async () => {
    if (hasToken()) {
      this.setState({
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
        const organization = await this.loadOrganization();

        // Uncomment this line if you want to set up
        // User-Id tracking. https://bit.ly/2DKQYEN.
        // setUserId(user.id);

        this.setState({
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
          await this.logout(true);
        } else {
          this.setState({
            error,
            loading: false,
            ready: true,
          });
        }
      }
    } else {
      this.setState({
        user: null,
        ready: true,
        loading: false,
      });
    }
  };

  updateUser = (data) => {
    this.setState({
      user: merge(this.state.user, data),
    });
  };

  clearUser = () => {
    this.setState({
      user: null,
      error: null,
    });
  };

  // Authentication

  login = async (body) => {
    this.setState({
      isLoggingIn: true,
    });
    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/password/login',
        body,
      });
      const redirect = await this.authenticate(data.token);
      this.setState({
        isLoggingIn: false,
      });
      return redirect;
    } catch (error) {
      this.setState({
        error,
        isLoggingIn: false,
      });
      throw error;
    }
  };

  logout = async (redirect) => {
    if (redirect) {
      this.pushRedirect();
    }

    if (hasToken()) {
      try {
        await request({
          method: 'POST',
          path: '/1/auth/logout',
        });
      } catch {
        // JWT token errors may throw here
      }
      setToken(null);
    }
    await this.bootstrap();
    this.props.history.push(this.popRedirect() || '/');
  };

  authenticate = async (token) => {
    setToken(token);
    await this.bootstrap();
    return this.popRedirect() || '/';
  };

  popRedirect = () => {
    const url = localStorage.getItem('redirect');
    localStorage.removeItem('redirect');
    return url;
  };

  pushRedirect = () => {
    const { pathname, search } = window.location;
    const url = pathname + search;
    if (url !== '/') {
      localStorage.setItem('redirect', url);
    }
  };

  isLoggedIn = () => {
    const { isLoggingIn } = this.state;
    return hasToken() && !isLoggingIn;
  };

  // Organizations

  loadOrganization = async () => {
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
  };

  // Session storage

  setStored = (key, data) => {
    this.updateStored(
      merge({}, this.state.stored, {
        [key]: data,
      })
    );
    trackSession('add', key, data);
  };

  removeStored = (key) => {
    this.updateStored(omit(this.state.stored, key));
    trackSession('remove', key);
  };

  clearStored = () => {
    this.updateStored({});
  };

  popStored = (key) => {
    const stored = this.state.stored[key];
    if (stored) {
      this.removeStored(key);
      return stored;
    }
  };

  loadStored = () => {
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

  updateStored = (data) => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('session', JSON.stringify(data));
    } else {
      localStorage.removeItem('session');
    }
    this.setState({
      stored: data,
    });
  };

  // History

  checkHistoryChange(lastProps) {
    if (this.props.location !== lastProps.location) {
      this.onHistoryChange();
    }
  }

  onHistoryChange = () => {
    this.setState({
      error: null,
    });
  };

  render() {
    return (
      <SessionContext.Provider
        value={{
          ...this.state,
          bootstrap: this.bootstrap,
          setStored: this.setStored,
          removeStored: this.removeStored,
          clearStored: this.clearStored,
          updateUser: this.updateUser,
          clearUser: this.clearUser,
          login: this.login,
          isLoggedIn: this.isLoggedIn,
          authenticate: this.authenticate,
          logout: this.logout,
          hasRoles: this.hasRoles,
          hasRole: this.hasRole,
          isAdmin: this.isAdmin,
          pushRedirect: this.pushRedirect,
        }}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}

export function useSession() {
  return useContext(SessionContext);
}

export const withSession = wrapContext(SessionContext);

export function withLoadedSession(Component) {
  Component = withSession(Component);
  return (props) => {
    const { loading } = useSession();
    if (loading) {
      return null;
    }
    return <Component {...props} />;
  };
}
