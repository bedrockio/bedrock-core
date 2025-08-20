import { Route, Routes } from '@bedrockio/router';

import Detail from './Detail';
import List from './List';
import NewShop from './New';

export default function Products() {
  return (
    <Routes>
      <Route path="/products" render={List} exact />
      <Route path="/products/new" render={NewShop} />
      <Route path="/products/:id" render={Detail} />
    </Routes>
  );
}
