import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';

export default class AuditLog extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/audit-Log" render={List} exact />
      </Routes>
    );
  }
}
