import React from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './List';
import Detail from './Detail';

export default class Shops extends React.Component {

  render() {
    return (
      <Switch>
        <Route path="/shops" component={List} exact />
        <Route path="/shops/:id" component={Detail} />
      </Switch>
    );
  }
}
