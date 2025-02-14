import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';

export default class Shops extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/shops" render={List} exact />
        <Route path="/shops/:id" render={Detail} />
      </Routes>
    );
  }
}
