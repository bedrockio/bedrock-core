import { Routes, Route } from '@bedrockio/router';

import PortalLayout from 'layouts/Portal';

import ApiDocs from 'docs/screens/ApiDocs/index.js';
import { DocsProvider } from 'docs/utils/context.js';

function App() {
  return (
    <DocsProvider>
      <PortalLayout>
        <Routes>
          <Route path="/docs" render={ApiDocs} />
        </Routes>
      </PortalLayout>
    </DocsProvider>
  );
}

export default App;
