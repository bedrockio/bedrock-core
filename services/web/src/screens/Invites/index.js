import { Route, Routes } from '@bedrockio/router';

import NotFound from 'screens/NotFound';

import List from './List';

export default function Users() {
  return (
    <Routes>
      <Route path="/users/invites" render={List} exact />
      <Route render={NotFound} />
    </Routes>
  );
}
