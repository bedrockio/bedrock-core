import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Details from './Details';

export default class Applications extends React.Component {
  render() {
    return (
      <Routes>
        <Route exact path="/applications" render={List} />
        <Route path="/applications/:id" render={Details} />
      </Routes>
    );
  }
}
