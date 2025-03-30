import { Routes, Route } from '@bedrockio/router';

import List from './List.js';
import NotFound from 'screens/NotFound';

export default function Users() {
  return (
    <Routes>
      <Route path="/invites" render={List} exact />
      <Route render={NotFound} />
    </Routes>
  );
}
