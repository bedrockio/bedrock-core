import React, { useContext } from 'react';
import { merge, omit } from 'lodash';
import { withRouter } from 'react-router-dom';
import { request, getToken, setToken, clearToken } from 'utils/api';
import { trackSession } from 'utils/analytics';
import { captureError } from 'utils/sentry';

const SessionContext = React.createContext();

@withRouter
export class SessionProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      loading: true,
      stored: this.loadStored(),
      organization: null,
    };
  }

  componentDidMount() {
    this.load();
    this.attachHistory();
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

  setToken = async (token) => {
    if (token) {
      setToken(token);
    } else {
      clearToken();
    }
  };

  load = async () => {
    if (getToken()) {
      this.setState({
        loading: true,
        error: null,
      });
      try {
        const { data: user } = await request({
          method: 'GET',
          path: '/1/users/me',
        });
        const organization = await this.loadOrganization();
        // Uncomment this line if you want to set up
        // User-Id tracking. https://bit.ly/2DKQYEN.
        // setUserId(data.id);
        this.setState({
          user,
          organization,
          loading: false,
        });
      } catch (error) {
        this.setState({
          error,
          loading: false,
        });
      }
    } else {
      this.setState({
        user: null,
        loading: false,
      });
    }
  };

  updateUser = (data) => {
    this.setState({
      user: merge({}, this.state.user, data),
    });
  };

  clearUser = () => {
    this.setState({
      user: null,
      error: null,
    });
  };

  logout = async () => {
    try {
      await request({
        method: 'POST',
        path: '/1/auth/logout',
      });
    } catch (err) {
      // JWT token errors may throw here
    }
    await this.setToken(null);
    document.location = '/';
  };

  addStored = (key, data) => {
    this.setStored(
      merge({}, this.state.stored, {
        [key]: data,
      })
    );
    trackSession('add', key, data);
  };

  getStored = (key) => {
    return this.state.stored[key];
  };

  removeStored = (key) => {
    this.setStored(omit(this.state.stored, key));
    trackSession('remove', key);
  };

  clearStored = () => {
    this.setStored({});
  };

  // Organizations

  loadOrganization = async () => {
    const organizationId = this.getStored('organizationId');
    if (organizationId) {
      try {
        const { data } = await request({
          method: 'GET',
          path: `/1/organizations/${organizationId}`,
        });
        return data;
      } catch (err) {
        if (err.status < 500) {
          this.removeStored('organizationId');
        }
      }
    }
  };

  setOrganization = (organization) => {
    this.addStored('organizationId', organization.id);
    this.setState({
      organization,
    });
  };

  getOrganization = () => {
    return this.state.organization;
  };

  // Session storage

  loadStored = () => {
    let data;
    try {
      const str = localStorage.getItem('session');
      if (str) {
        data = JSON.parse(str);
      }
    } catch (err) {
      localStorage.removeItem('session');
    }
    return data || {};
  };

  setStored = (data) => {
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

  attachHistory = () => {
    this.props.history.listen(this.onHistoryChange);
  };

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
          load: this.load,
          setToken: this.setToken,
          addStored: this.addStored,
          getStored: this.getStored,
          removeStored: this.removeStored,
          clearStored: this.clearStored,
          updateUser: this.updateUser,
          clearUser: this.clearUser,
          logout: this.logout,
          hasRoles: this.hasRoles,
          hasRole: this.hasRole,
          isAdmin: this.isAdmin,
          setOrganization: this.setOrganization,
          getOrganization: this.getOrganization,
        }}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}

export function withSession(Component) {
  let lastContext = {};

  return class Wrapped extends Component {
    // Preserve the component name
    static name = Component.name;

    static contextType = SessionContext;

    componentDidMount() {
      lastContext = this.context;
      if (super.componentDidMount) {
        super.componentDidMount();
      }
    }

    getSnapshotBeforeUpdate() {
      const context = lastContext;
      lastContext = this.context;
      return context;
    }
  };
}

export function withLoadedSession(Component) {
  Component = withSession(Component);
  return class Wrapped extends React.Component {
    static contextType = SessionContext;

    render() {
      return <Component {...this.props} />;
    }
  };
}

export function useSession() {
  return useContext(SessionContext);
}
