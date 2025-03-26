import { Routes, Route } from '@bedrockio/router';

import List from './List';
import New from './New';
import Detail from './Detail';

export default function Users() {
  return (
    <Routes>
      <Route path="/users" render={List} exact />
      <Route path="/users/new" render={New} exact />
      <Route path="/users/:id" render={Detail} />
    </Routes>
  );
}
