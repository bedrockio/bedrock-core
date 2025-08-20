import { Route, Routes } from '@bedrockio/router';

import Detail from './Detail';
import List from './List';
import New from './New';

export default function Templates() {
  return (
    <Routes>
      <Route path="/templates" render={List} exact />
      <Route path="/templates/new" render={New} />
      <Route path="/templates/:id" render={Detail} />
    </Routes>
  );
}
