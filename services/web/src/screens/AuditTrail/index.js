import React from 'react';

import { Switch, Route } from 'react-router-dom';

import { withDashboardLayout } from 'layouts/Dashboard';

import List from './List';

@withDashboardLayout
export default class Organizations extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/audit-trail" component={List} exact />
      </Switch>
    );
  }
}
