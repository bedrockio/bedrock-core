import { Routes, Route } from '@bedrockio/router';

import List from './List.js';

export default function Users() {
  return (
    <Routes>
      <Route path="/invites" render={List} exact />
    </Routes>
  );
}
