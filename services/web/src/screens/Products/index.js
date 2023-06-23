import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { withDashboardLayout } from 'layouts/Dashboard';

import List from './List';
import Detail from './Detail';

@withDashboardLayout
export default class Products extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/products" component={List} exact />
        <Route path="/products/:id" component={Detail} />
      </Switch>
    );
  }
}
