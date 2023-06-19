import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { withDashboardLayout } from 'layouts/Dashboard';

import List from './List';
import Detail from './Detail';

@withDashboardLayout
export default class Users extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/users" component={List} exact />
        <Route path="/users/:id" component={Detail} />
      </Switch>
    );
  }
}
