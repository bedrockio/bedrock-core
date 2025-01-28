import { hot } from 'react-hot-loader/root';
import { Switch, Redirect } from 'react-router-dom';

import { Protected } from 'helpers/routes';
import BasicLayout from 'layouts/Basic';

import Onboard from 'screens/Onboard';

function App() {
  return (
    <BasicLayout>
      <Switch>
        <Protected path="/onboard" allowed={Onboard} />
        <Redirect to="/onboard" />
      </Switch>
    </BasicLayout>
  );
}

export default hot(App);
