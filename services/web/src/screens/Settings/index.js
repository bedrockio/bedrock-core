import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Account from './Account';
import Security from './Security';
import MFASms from './MFASms';
import MFAAuthenticator from './MFAAuthenticator';

export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Redirect exact path="/settings" to="/settings/account" />
        <Route exact path="/settings/account" component={Account} />
        <Route exact path="/settings/security" component={Security} />
        <Route exact path="/settings/mfa-sms" component={MFASms} />
        <Route
          exact
          path="/settings/mfa-authenticator"
          component={MFAAuthenticator}
        />
        <Redirect exact to="/settings/account" />
      </Switch>
    );
  }
}
