import { hot } from 'react-hot-loader/root';

import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';
import { AuthSwitch, Protected } from 'helpers/routes';
import { useSession } from 'stores';

import Dashboard from 'screens/Dashboard';
import Docs from 'screens/Docs';
import Components from 'screens/Components';
import Invites from 'screens/Invites';
import NotFound from 'screens/NotFound';
import Settings from 'screens/Settings';
import Shops from 'screens/Shops';
import Users from 'screens/Users';

import AcceptInvite from 'screens/Auth/AcceptInvite';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import ResetPassword from 'screens/Auth/ResetPassword';
import ConfirmAccess from 'screens/Auth/ConfirmAccess';
import MfaVerification from 'screens/Auth/MfaVerification';
import MfaBackupVerification from 'screens/Auth/MfaBackupVerification';
import Login from 'screens/Auth/Login';
import Logout from 'screens/Auth/Logout';
import Signup from 'screens/Auth/Signup';
import Organizations from 'screens/Organizations';
import Loading from 'screens/Loading';
import Error from 'screens/Error';
import Products from 'screens/Products';

import ConnectionError from 'components/ConnectionError';

const App = () => {
  const { loading, error } = useSession();
  if (loading) {
    return <Loading />;
  } else if (error) {
    return <Error error={error} />;
  }
  return (
    <React.Fragment>
      <ConnectionError />
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
    </React.Fragment>
  );
};

export default hot(App);
