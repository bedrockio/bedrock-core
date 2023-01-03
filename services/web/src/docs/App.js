import { hot } from 'react-hot-loader/root';

import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Components from './screens/Components';
import IconSheet from './screens/IconSheet';
import ApiDocs from './screens/ApiDocs';

function App() {
  return (
    <Switch>
      <Route path="/docs/ui" component={Components} exact />
      <Route path="/docs/icons" component={IconSheet} exact />
      <Route path="/docs/:id?" component={ApiDocs} />
    </Switch>
  );
}

export default hot(App);
