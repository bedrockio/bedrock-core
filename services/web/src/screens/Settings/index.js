import { Redirect, Route, Routes } from '@bedrockio/router';
import React from 'react';

import Details from './Details';
import Notifications from './Notifications';
import Security from './Security';

export default class Settings extends React.Component {
  render() {
    return (
      <Routes>
        <Route exact path="/settings/details" render={Details} />
        <Route exact path="/settings/security" render={Security} />
        <Route exact path="/settings/notifications" render={Notifications} />
        <Redirect to="/settings/details" />
      </Routes>
    );
  }
}
