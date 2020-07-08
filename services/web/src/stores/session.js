import React from 'react';
import { request } from 'utils/api';

const SessionContext = React.createContext();

export class SessionProvider extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.loadUser();
  }

  isAdmin = () => {
    return this.hasRole('admin');
  }

  hasRole = (role) => {
    const { user } = this.state;
    return user?.roles.includes(role);
  }

  setToken = async (token) => {
    if (token) {
      localStorage.setItem('jwt', token);
      await this.loadUser();
    } else {
      localStorage.removeItem('jwt');
      this.clearUser();
    }
  }

  loadUser = async () => {
    if (localStorage.getItem('jwt')) {
      this.setState({
        loading: true,
        error: null,
      });
      try {
        const { data } = await request({
          method: 'GET',
          path: '/1/users/me'
        });
        this.setState({
          user: data,
          loading: false,
        });
      } catch(error) {
        this.setState({
          error,
          loading: false
        });
      }
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  clearUser = () => {
    this.setState({
      user: null,
    });
  }

  render() {
    return (
      <SessionContext.Provider
        value={{
          ...this.state,
          setToken: this.setToken,
          loadUser: this.loadUser,
          isAdmin: this.isAdmin,
          hasRole: this.hasRole,
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
