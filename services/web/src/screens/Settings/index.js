import React from 'react';
import { Routes, Route, Redirect } from '@bedrockio/router';

import Details from './Details';
import Security from './Security';
import Sessions from './Sessions';
import Authenticator from './Authenticator';

export default class Settings extends React.Component {
  render() {
    return (
      <Routes>
        <Route exact path="/settings/details" render={Details} />
        <Route exact path="/settings/security" render={Security} />
        <Route exact path="/settings/sessions" render={Sessions} />
        <Route exact path="/settings/authenticator" render={Authenticator} />
        <Redirect exact to="/settings/details" />
      </Routes>
    );
  }
}
