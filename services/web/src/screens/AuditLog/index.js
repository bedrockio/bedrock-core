import { Route, Routes } from '@bedrockio/router';
import React from 'react';

import List from './List';

export default class AuditLog extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/organization/audit-log" render={List} exact />
      </Routes>
    );
  }
}
