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

import Login from 'screens/Auth/Login/Password';
import Signup from 'screens/Auth/Signup';
import LoginCode from 'screens/Auth/Login/Code';
import AcceptInvite from 'screens/Auth/AcceptInvite';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import ResetPassword from 'screens/Auth/ResetPassword';
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
      <Route path="/login" component={Login} exact />
      <Route path="/signup" component={Signup} exact />
      <Route path="/login/code" component={LoginCode} exact />
      <Route path="/accept-invite" component={AcceptInvite} exact />
      <Route path="/forgot-password" component={ForgotPassword} exact />
      <Route path="/reset-password" component={ResetPassword} exact />
      <Route path="/logout" component={Logout} exact />
      <Protected allowed={NotFound} />
    </Switch>
  );
};

export default hot(App);
