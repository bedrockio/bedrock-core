import { Routes, Route } from '@bedrockio/router';

import ApiDocs from 'docs/screens/ApiDocs/index.js';
import { DocsProvider } from 'docs/utils/context.js';

function App() {
  return (
    <DocsProvider>
      <Routes>
        <Route path="/docs" render={ApiDocs} />
      </Routes>
    </DocsProvider>
  );
}

export default App;
