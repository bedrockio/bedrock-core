import { Redirect, Route, Routes } from '@bedrockio/router';
import React from 'react';

import Details from './Details';
import Security from './Security';

export default class Settings extends React.Component {
  render() {
    return (
      <Routes>
        <Route exact path="/settings/details" render={Details} />
        <Route exact path="/settings/security" render={Security} />
        <Redirect to="/settings/details" />
      </Routes>
    );
  }
}
