import { hot } from 'react-hot-loader/root';

import React from 'react';

import { Switch, Redirect } from 'react-router-dom';
import { AuthSwitch, Protected, Route } from 'helpers/routes';
import { useSession } from 'stores';

import Dashboard from 'screens/Dashboard';

const Docs = React.lazy(() => import('./screens/Docs'));
const Components = React.lazy(() => import('./screens/Components'));
const Settings = React.lazy(() => import('./screens/Settings'));
const Invites = React.lazy(() => import('./screens/Invites'));
const NotFound = React.lazy(() => import('./screens/NotFound'));

const Shops = React.lazy(() => import('./screens/Shops'));
const Users = React.lazy(() => import('./screens/Users'));

const AcceptInvite = React.lazy(() => import('./screens/Auth/AcceptInvite'));
const ForgotPassword = React.lazy(() =>
  import('./screens/Auth/ForgotPassword')
);
const ResetPassword = React.lazy(() => import('./screens/Auth/ResetPassword'));
const ConfirmAccess = React.lazy(() => import('./screens/Auth/ConfirmAccess'));
const MfaVerification = React.lazy(() =>
  import('./screens/Auth/MfaVerification')
);
const MfaBackupVerification = React.lazy(() =>
  import('./screens/Auth/MfaBackupVerification')
);
const Login = React.lazy(() => import('./screens/Auth/Login'));
const Logout = React.lazy(() => import('./screens/Auth/Logout'));
const Signup = React.lazy(() => import('./screens/Auth/Signup'));

const Organizations = React.lazy(() => import('./screens/Organizations'));
const Products = React.lazy(() => import('./screens/Products'));

import Loading from 'screens/Loading';
import Error from 'screens/Error';

const App = () => {
  const { loading, error } = useSession();
  if (loading) {
    return <Loading />;
  } else if (error) {
    return <Error error={error} />;
  }
  return (
    <Switch>
      <AuthSwitch path="/" loggedIn={Dashboard} loggedOut={Login} exact />
      <Protected path="/shops/:id?" allowed={Shops} />
      <Protected path="/products/:id?" allowed={Products} />
      <Protected path="/settings/:id?" allowed={Settings} exact />
      <Protected path="/users/invites" allowed={Invites} exact />
      <Protected path="/organizations/:id?" allowed={Organizations} />
      <Protected path="/users/:id?" allowed={Users} />
      <Route path="/docs/ui" component={Components} exact />
      <Route path="/docs/:id?" component={Docs} />
      <Route path="/logout" component={Logout} exact />
      <AuthSwitch
        path="/login/verification"
        loggedOut={MfaVerification}
        loggedIn={() => <Redirect to="/" />}
        exact
      />
      <AuthSwitch
        path="/login/verification/backup"
        loggedOut={MfaBackupVerification}
        loggedIn={() => <Redirect to="/" />}
        exact
      />
      <AuthSwitch
        path="/login"
        loggedOut={Login}
        loggedIn={() => <Redirect to="/" />}
        exact
      />
      <AuthSwitch
        path="/signup"
        loggedOut={Signup}
        loggedIn={() => <Redirect to="/" />}
        exact
      />
      <Route path="/accept-invite" component={AcceptInvite} exact />
      <Route path="/forgot-password" component={ForgotPassword} exact />
      <Route path="/reset-password" component={ResetPassword} exact />
      <Protected path="/confirm-access" allowed={ConfirmAccess} exact />
      <Route component={NotFound} />
    </Switch>
  );
};

export default hot(App);
