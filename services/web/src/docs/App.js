import { hot } from 'react-hot-loader/root';
import { Route, Switch } from 'react-router-dom';

import PortalLayout from 'layouts/Portal';

import Components from './screens/Components';
import IconSheet from './screens/IconSheet';
import ApiDocs from './screens/ApiDocs';
import { DocsProvider } from './utils/context';

function App() {
  return (
    <DocsProvider>
      <PortalLayout>
        <Switch>
          <Route path="/docs/ui" component={Components} exact />
          <Route path="/docs/icons" component={IconSheet} exact />
          <Route path="/docs" component={ApiDocs} />
        </Switch>
      </PortalLayout>
    </DocsProvider>
  );
}

export default hot(App);
