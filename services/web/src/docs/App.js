import { hot } from 'react-hot-loader/root';
import { Route, Switch } from 'react-router-dom';

import Components from './screens/Components';
import IconSheet from './screens/IconSheet';
import ApiDocs from './screens/ApiDocs';
import { DocsProvider } from './utils/context';

function App() {
  return (
    <DocsProvider>
      <Switch>
        <Route path="/docs/ui" component={Components} exact />
        <Route path="/docs/icons" component={IconSheet} exact />
        <Route path="/docs/:id?" component={ApiDocs} />
      </Switch>
    </DocsProvider>
  );
}

export default hot(App);
