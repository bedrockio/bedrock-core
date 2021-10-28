import React from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './List';
import Detail from './Detail';

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
