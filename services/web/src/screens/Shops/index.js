import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List.js';
import Detail from './Detail/index.js';
import New from './New.js';

export default class Shops extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/shops" render={List} exact />
        <Route path="/shops/new" render={New} />
        <Route path="/shops/:id" render={Detail} />
      </Routes>
    );
  }
}
