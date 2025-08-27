import { Route, Routes } from '@bedrockio/router';

import Detail from './Detail';
import List from './List';
import New from './New';

export default function Users() {
  return (
    <Routes>
      <Route path="/users" render={List} exact />
      <Route path="/users/new" render={New} exact />
      <Route path="/users/:id" render={Detail} />
    </Routes>
  );
}
