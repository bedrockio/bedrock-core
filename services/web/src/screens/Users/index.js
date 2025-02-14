import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';

export default class Users extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/users" render={List} exact />
        <Route path="/users/:id" render={Detail} />
      </Routes>
    );
  }
}
