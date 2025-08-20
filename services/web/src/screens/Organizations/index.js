import { Routes, Route } from '@bedrockio/router';

import List from './List';
import Detail from './Detail';
import NewOrganization from './New';

export default function Organizations() {
  return (
    <Routes>
      <Route path="/organizations" render={List} exact />
      <Route path="/organizations/new" render={NewOrganization} />
      <Route path="/organizations/:id" render={Detail} />
    </Routes>
  );
}
