import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';

export default class Organizations extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/organizations" render={List} exact />
        <Route path="/organizations/:id" render={Detail} />
      </Routes>
    );
  }
}
