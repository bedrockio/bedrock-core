import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Applications from './Applications';

export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/developers/applications" component={Applications} />
        <Redirect exact path="/developers" to="/developers/applications" />
      </Switch>
    );
  }
}
