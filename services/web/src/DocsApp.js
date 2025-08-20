import { Route, Routes } from '@bedrockio/router';

import ApiDocs from 'docs/screens/ApiDocs';
import { DocsProvider } from 'docs/utils/context';

export default function DocsApp() {
  return (
    <DocsProvider>
      <Routes>
        <Route path="/docs" render={ApiDocs} />
      </Routes>
    </DocsProvider>
  );
}
