import { hot } from 'react-hot-loader/root';

import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';
import { AuthSwitch, Protected } from 'helpers/routes';

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
import Login from 'screens/Auth/Login';
import Logout from 'screens/Auth/Logout';
import Signup from 'screens/Auth/Signup';

const App = () => (
  <Switch>
    <AuthSwitch path="/" loggedIn={Dashboard} loggedOut={Login} exact />
    <Protected path="/shops/:id?" allowed={Shops} />
    <Protected path="/settings" allowed={Settings} exact />
    <Protected path="/users/invites" allowed={Invites} exact />
    <Protected path="/users/:id?" allowed={Users} />
    <Route path="/docs/ui/components" component={Components} exact />
    <Route path="/docs/api/:id?" component={Docs} />
    <Route path="/logout" component={Logout} exact />
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
    <Route component={NotFound} />
  </Switch>
);

export default hot(App);
