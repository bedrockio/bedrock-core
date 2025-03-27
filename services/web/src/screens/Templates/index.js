import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';

export default class Templates extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/templates" render={List} exact />
        <Route path="/templates/:id" render={Detail} />
      </Routes>
    );
  }
}
