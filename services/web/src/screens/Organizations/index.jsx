import React from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './List';
import Detail from './Detail';

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
