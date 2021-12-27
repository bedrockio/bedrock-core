import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Applications from './Applications';
import Logs from './Logs';

export default class Settings extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/developers" component={Applications} />
        <Route exact path="/developers/logs" component={Logs} />
      </Switch>
    );
  }
}
