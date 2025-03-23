import React from 'react';
import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';
import NewShop from './New';

export default class Products extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/products" render={List} exact />
        <Route path="/products/new" render={NewShop} />
        <Route path="/products/:id" render={Detail} />
      </Routes>
    );
  }
}
