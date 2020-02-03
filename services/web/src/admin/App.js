import 'semantic-ui-less/semantic.less';
import { hot } from 'react-hot-loader/root';

import { Switch, Route, Redirect } from 'react-router-dom';
import React from 'react';

import AuthSwitchRoute from './routes/AuthSwitch';
import Protected from './routes/Protected';

import Homepage from './screens/Homepage';
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
    <AuthSwitchRoute exact path="/admin/" loggedIn={Dashboard} loggedOut={Homepage} />
    <Protected exact path="/admin/shops" component={Shops} />
    <Protected exact path="/admin/shops/:id" component={Shop} />
    <Protected exact path="/admin/shops/:id/*" component={Shop} />
    <Protected exact path="/admin/settings" component={Settings} />
    <Protected exact path="/admin/invites" component={Invites} />
    <Protected exact path="/admin/users" component={Users} />
    <Route exact path="/admin/logout" component={Logout} />
    <AuthSwitchRoute
      exact
      path="/admin/login"
      loggedOut={Login}
      loggedIn={() => <Redirect to="/admin/" />}
    />
    <AuthSwitchRoute
      exact
      path="/admin/signup"
      loggedOut={Signup}
      loggedIn={() => <Redirect to="/admin/" />}
    />
    <Route exact path="/admin/accept-invite" component={AcceptInvite} />
    <Route exact path="/admin/forgot-password" component={ForgotPassword} />
    <Route exact path="/admin/reset-password" component={ResetPassword} />
  </Switch>
);

export default hot(App);
