import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Account from './Account';
import Security from './Security';
import MfaSms from './mfa/Sms';
import MfaAuthenticator from './mfa/Authenticator';


export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Redirect exact path="/settings" to="/settings/account" />
        <Route exact path="/settings/account" component={Account} />
        <Route exact path="/settings/security" component={Security} />
        <Route exact path="/settings/mfa-sms" component={MfaSms} />
        <Route
          exact
          path="/settings/mfa-authenticator"
          component={MfaAuthenticator}
        />
        <Redirect exact to="/settings/account" />
      </Switch>
    );
  }
}
