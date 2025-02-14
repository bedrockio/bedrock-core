import React from 'react';
import { Routes, Route, Redirect } from '@bedrockio/router';

import Profile from './Profile';
import Security from './Security';
import Sessions from './Sessions';
import Appearance from './Appearance';
import Notifications from './Notifications';
import Authenticator from './Authenticator';

export default class Settings extends React.Component {
  render() {
    return (
      <Routes>
        <Route exact path="/settings/profile" render={Profile} />
        <Route exact path="/settings/notifications" render={Notifications} />
        <Route exact path="/settings/appearance" render={Appearance} />
        <Route exact path="/settings/security" render={Security} />
        <Route exact path="/settings/sessions" render={Sessions} />
        <Route exact path="/settings/authenticator" render={Authenticator} />
        <Redirect exact to="/settings/profile" />
      </Routes>
    );
  }
}
