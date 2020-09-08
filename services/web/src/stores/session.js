import React from 'react';
import { merge, omit } from 'lodash';
import { request } from 'utils/api';
import { trackSession, setUserId } from 'utils/analytics';

const SessionContext = React.createContext();

export class SessionProvider extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      loading: true,
      stored: this.loadStored(),
    };
  }

  componentDidMount() {
    this.loadUser();
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

  setToken = async (token) => {
    if (token) {
      localStorage.setItem('jwt', token);
      await this.loadUser();
    } else {
      localStorage.removeItem('jwt');
      this.clearUser();
    }
  };

  loadUser = async () => {
    if (localStorage.getItem('jwt')) {
      this.setState({
        loading: true,
        error: null,
      });
      try {
        const { data } = await request({
          method: 'GET',
          path: '/1/users/me',
        });
        // Uncomment this line if you want to set up
        // User-Id tracking. https://bit.ly/2DKQYEN.
        // setUserId(data.id);
        this.setState({
          user: data,
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
    });
  };

  addStored = (key, data) => {
    this.setStored(
      merge({}, this.state.stored, {
        [key]: data
      })
    );
    trackSession('add', key, data);
  };

  removeStored = (key) => {
    this.setStored(
      omit(this.state.stored, key)
    );
    trackSession('remove', key);
  };

  clearStored = () => {
    this.setStored({});
  };

  loadStored() {
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
  }

  setStored(data) {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('session', JSON.stringify(data));
    } else {
      localStorage.removeItem('session');
    }
    this.setState({
      stored: data,
    });
  }

  render() {
    return (
      <SessionContext.Provider
        value={{
          ...this.state,
          setToken: this.setToken,
          addStored: this.addStored,
          removeStored: this.removeStored,
          clearStored: this.clearStored,
          updateUser: this.updateUser,
          loadUser: this.loadUser,
          hasRoles: this.hasRoles,
          isAdmin: this.isAdmin,
        }}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}

export function withSession(Component) {
  Component.contextType = SessionContext;
  return Component;
}
