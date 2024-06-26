import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Login from './Login';
import Account from './Account';
import Sessions from './Sessions';
import Appearance from './Appearance';
import Notifications from './Notifications';
import Authenticator from './Authenticator';

export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/settings/account" component={Account} />
        <Route exact path="/settings/notifications" component={Notifications} />
        <Route exact path="/settings/appearance" component={Appearance} />
        <Route exact path="/settings/login" component={Login} />
        <Route exact path="/settings/sessions" component={Sessions} />
        <Route exact path="/settings/authenticator" component={Authenticator} />
        <Redirect exact to="/settings/account" />
      </Switch>
    );
  }
}
