import React from 'react';
import { Route } from 'react-router-dom';
import { session } from 'stores';
import Boot from 'components/Boot';

export default class AuthSwitch extends React.Component {

  render() {
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
