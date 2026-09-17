import { Route, Routes } from '@bedrockio/router';

import Detail from './Detail';
import List from './List';
import New from './New';

export default function Templates() {
  return (
    <Routes>
      <Route path="/organization/templates" render={List} exact />
      <Route path="/organization/templates/new" render={New} />
      <Route path="/organization/templates/:id" render={Detail} />
    </Routes>
  );
}
