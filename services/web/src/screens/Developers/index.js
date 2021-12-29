import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Applications from './Applications';
import Logs from './Logs';
import Overview from './Overview';

export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/developers" component={Overview} />
        <Route exact path="/developers/logs" component={Logs} />
        <Route exact path="/developers/applications" component={Applications} />
      </Switch>
    );
  }
}
