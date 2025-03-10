import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';
import Edit from './Edit';

export default class Shops extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/shops" render={List} exact />
        <Route path="/shops/new" render={Edit} />
        <Route path="/shops/:id" render={Detail} />
        <Route path="/shops/:id/edit" render={Edit} />
      </Routes>
    );
  }
}
