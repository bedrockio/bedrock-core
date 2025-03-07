import { Routes, Route } from '@bedrockio/router';

import PortalLayout from 'layouts/Portal';

import Components from 'docs/screens/Components.js';
import IconSheet from 'docs/screens/IconSheet.js';
import ApiDocs from 'docs/screens/ApiDocs/index.js';
import { DocsProvider } from 'docs/utils/context.js';

function App() {
  return (
    <DocsProvider>
      <PortalLayout>
        <Routes>
          <Route path="/docs/ui" render={Components} exact />
          <Route path="/docs/icons" render={IconSheet} exact />
          <Route path="/docs" render={ApiDocs} />
        </Routes>
      </PortalLayout>
    </DocsProvider>
  );
}

export default App;
