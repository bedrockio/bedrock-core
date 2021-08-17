import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Account from './Account';
import Security from './Security';

export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Redirect exact path="/settings" to="/settings/account" />
        <Route
          exact
          path="/settings/account"
          render={(props) => <Account {...props} {...this.context} />}
        />
        <Route
          exact
          path="/settings/security"
          render={(props) => <Security {...props} {...this.context} />}
        />
        <Redirect exact to="/settings/account" />
      </Switch>
    );
  }
}
