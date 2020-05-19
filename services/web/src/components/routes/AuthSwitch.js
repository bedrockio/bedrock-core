import React from 'react';
import { observer, inject } from 'mobx-react';
import { Route } from 'react-router-dom';
import Boot from 'components/Boot';
import { AppSession } from 'contexts/appSession';

export default class AuthSwitchRoute extends React.Component {
  static contextType = AppSession;

  render() {
    const { loggedIn: LoggedInComponent, loggedOut: LoggedOutComponent, to, exact } = this.props;
    const { token } = this.context;

    return (
      <Route
        to={to}
        exact={exact}
        render={props => {
          return token ? (
            <Boot>
              <LoggedInComponent {...props} />
            </Boot>
          ) : (
            <>
              <LoggedOutComponent {...props} />
            </>
          );
        }}
      />
    );
  }
}
