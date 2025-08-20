import { Routes, Route } from '@bedrockio/router';

import List from './List';
import NotFound from 'screens/NotFound';

export default function Users() {
  return (
    <Routes>
      <Route path="/users/invites" render={List} exact />
      <Route render={NotFound} />
    </Routes>
  );
}
