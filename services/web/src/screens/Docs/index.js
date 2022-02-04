import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';

import Components from './Components';
import Docs from './Docs';
import DocsProvider from './Context';

export default class PortalLayout extends React.Component {
  render() {
    return (
      <DocsProvider>
        <Switch>
          <Route path="/docs/ui" component={Components} exact />
          <Route path="/docs/:id" component={Docs} />
          <Redirect to="/docs/getting-started" />
        </Switch>
      </DocsProvider>
    );
  }
}
