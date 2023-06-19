import React from 'react';

import { Switch, Route } from 'react-router-dom';

import { withDashboardLayout } from 'layouts/Dashboard';

import List from './List';
import Details from './Details';

@withDashboardLayout
export default class Applications extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/applications" component={List} />
        <Route path="/applications/:id" component={Details} />
      </Switch>
    );
  }
}
