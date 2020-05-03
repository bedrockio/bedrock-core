import 'theme/semantic.less';
import { hot } from 'react-hot-loader/root';

import { Switch, Route, Redirect } from 'react-router-dom';
import React from 'react';

import AuthSwitchRoute from 'components/routes/AuthSwitch';
import Protected from 'components/routes/Protected';

import DocsGettingStarted from './screens/Docs/GettingStarted';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Invites from './screens/Invites';
import Users from './screens/Users';
import AcceptInvite from './screens/Auth/AcceptInvite';
import Login from './screens/Auth/Login';
import Shops from './screens/Shops';
import Shop from './screens/Shop';
import Logout from './screens/Auth/Logout';
import ForgotPassword from './screens/Auth/ForgotPassword';
import Signup from './screens/Auth/Signup';
import ResetPassword from './screens/Auth/ResetPassword';

const App = () => (
  <Switch>
    <AuthSwitchRoute exact path="/" loggedIn={Dashboard} loggedOut={Login} />
    <Protected exact path="/shops" component={Shops} />
    <Protected exact path="/shops/:id" component={Shop} />
    <Protected exact path="/shops/:id/*" component={Shop} />
    <Protected exact path="/settings" component={Settings} />
    <Protected exact path="/invites" component={Invites} />
    <Protected exact path="/users" component={Users} />
    <Protected
      exact
      path="/docs/getting-started"
      component={DocsGettingStarted}
    />
    <Route exact path="/logout" component={Logout} />
    <AuthSwitchRoute
      exact
      path="/login"
      loggedOut={Login}
      loggedIn={() => <Redirect to="/" />}
    />
    <AuthSwitchRoute
      exact
      path="/signup"
      loggedOut={Signup}
      loggedIn={() => <Redirect to="/" />}
    />
    <Route exact path="/accept-invite" component={AcceptInvite} />
    <Route exact path="/forgot-password" component={ForgotPassword} />
    <Route exact path="/reset-password" component={ResetPassword} />
  </Switch>
);

export default hot(App);
