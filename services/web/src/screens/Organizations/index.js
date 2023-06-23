import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { withDashboardLayout } from 'layouts/Dashboard';

import List from './List';
import Detail from './Detail';

@withDashboardLayout
export default class Organizations extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/organizations" component={List} exact />
        <Route path="/organizations/:id" component={Detail} />
      </Switch>
    );
  }
}
