import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List.js';
import Detail from './Detail/index.js';
import Edit from './Detail/Edit.js';

export default class Shops extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/shops" render={List} exact />
        <Route path="/shops/new" render={Edit} exact />
        <Route path="/shops/:id" render={Detail} />
      </Routes>
    );
  }
}
