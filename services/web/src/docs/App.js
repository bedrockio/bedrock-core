import { Routes, Route } from '@bedrockio/router';

import PortalLayout from 'layouts/Portal';

import Components from './screens/Components';
import IconSheet from './screens/IconSheet';
import ApiDocs from './screens/ApiDocs';
import { DocsProvider } from './utils/context';

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
