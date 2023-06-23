import { hot } from 'react-hot-loader/root';
import { Switch, Route } from 'react-router-dom';

import { Protected } from 'helpers/routes';

import Dashboard from 'screens/Dashboard';
import Invites from 'screens/Invites';
import NotFound from 'screens/NotFound';
import Settings from 'screens/Settings';
import Shops from 'screens/Shops';
import Users from 'screens/Users';
import Organizations from 'screens/Organizations';
import Products from 'screens/Products';
import Applications from 'screens/Applications';
import AuditTrail from 'screens/AuditTrail';

import Login from 'screens/Auth/Login';
import Logout from 'screens/Auth/Logout';
import Signup from 'screens/Auth/Signup';
import AcceptInvite from 'screens/Auth/AcceptInvite';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import ResetPassword from 'screens/Auth/ResetPassword';
import ConfirmAccess from 'screens/Auth/ConfirmAccess';
import MfaVerification from 'screens/Auth/MfaVerification';
import MfaBackupVerification from 'screens/Auth/MfaBackupVerification';

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
      <Route path="/logout" component={Logout} exact />
      <Route path="/login" component={Login} exact />
      <Route path="/signup" component={Signup} exact />
      <Route path="/accept-invite" component={AcceptInvite} exact />
      <Route path="/forgot-password" component={ForgotPassword} exact />
      <Route path="/reset-password" component={ResetPassword} exact />
      <Route path="/login/verification" component={MfaVerification} exact />
      <Route
        path="/login/verification/backup"
        component={MfaBackupVerification}
        exact
      />
      <Protected path="/confirm-access" allowed={ConfirmAccess} exact />
      <Protected allowed={NotFound} />
    </Switch>
  );
};

export default hot(App);
