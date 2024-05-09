import { hot } from 'react-hot-loader/root';
import { Switch, Route } from 'react-router-dom';

import { Protected } from 'helpers/routes';

import Dashboard from 'screens/Dashboard';
import Shops from 'screens/Shops';
import Products from 'screens/Products';
import Users from 'screens/Users';
import NotFound from 'screens/NotFound';
import Settings from 'screens/Settings';
import Organizations from 'screens/Organizations';
import Applications from 'screens/Applications';
import AuditTrail from 'screens/AuditTrail';
import Invites from 'screens/Invites';

import AcceptInvite from 'screens/Auth/AcceptInvite';
import Logout from 'screens/Auth/Logout';

const App = () => {
  return (
    <Switch>
      <Protected path="/" allowed={Dashboard} exact />
      <Protected path="/shops/:id?" allowed={Shops} />
      <Protected path="/products/:id?" allowed={Products} />
      <Protected path="/settings/:id?" allowed={Settings} exact />
      <Protected path="/users/invites" allowed={Invites} exact />
      <Protected path="/organizations/:id?" allowed={Organizations} />
      <Protected path="/users/:id?" allowed={Users} />
      <Protected path="/applications/:id?" allowed={Applications} />
      <Protected path="/audit-trail/:id?" allowed={AuditTrail} />
      <Route path="/accept-invite" component={AcceptInvite} exact />
      <Route path="/logout" component={Logout} exact />
      <Protected allowed={NotFound} />
    </Switch>
  );
};

export default hot(App);
