import React from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './List';
import Detail from './Detail';

export default class Videos extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/videos" component={List} exact />
        <Route path="/videos/:id" component={Detail} />
      </Switch>
    );
  }
}
