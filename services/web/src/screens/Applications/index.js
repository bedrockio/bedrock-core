import { Route, Routes } from '@bedrockio/router';
import React from 'react';

import Details from './Details';
import List from './List';
import New from './New';

export default class Applications extends React.Component {
  render() {
    return (
      <Routes>
        <Route exact path="/applications" render={List} />
        <Route path="/applications/new" render={New} />
        <Route path="/applications/:id" render={Details} />
      </Routes>
    );
  }
}
