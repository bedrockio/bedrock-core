import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';

export default class Organizations extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/audit-trail" render={List} exact />
      </Routes>
    );
  }
}
