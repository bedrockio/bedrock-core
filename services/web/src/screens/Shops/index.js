import { Route, Routes } from '@bedrockio/router';

import Detail from './Detail';
import List from './List';
import New from './New';

export default function Shops() {
  return (
    <Routes>
      <Route path="/shops" render={List} exact />
      <Route path="/shops/new" render={New} />
      <Route path="/shops/:id" render={Detail} />
    </Routes>
  );
}
