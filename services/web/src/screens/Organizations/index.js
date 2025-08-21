import { Route, Routes } from '@bedrockio/router';

import Detail from './Detail';
import List from './List';
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
