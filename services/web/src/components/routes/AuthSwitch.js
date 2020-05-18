import React from 'react';
import { Route } from 'react-router-dom';
import Boot from 'components/Boot';
import inject from 'stores/inject';

@inject('session')
export default class AuthSwitchRoute extends React.Component {

  render() {
    const { session } = this.context;
    const {
      loggedIn: LoggedInComponent,
      loggedOut: LoggedOutComponent,
      ...rest
    } = this.props;

    return (
      <Route
        {...rest}
        render={(props) => {
          return session.token ? (
            <Boot>
              <LoggedInComponent {...props} />
            </Boot>
          ) : (
            <LoggedOutComponent {...props} />
          );
        }}
      />
    );
  }
}
