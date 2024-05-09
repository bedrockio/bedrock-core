import { hot } from 'react-hot-loader/root';

import { Switch, Route } from 'react-router-dom';

import BasicLayout from 'layouts/Basic';

import Lockout from 'screens/Lockout';
import Login from 'screens/Auth/Login/Password';
import LoginCode from 'screens/Auth/Login/Code';

import Signup from 'screens/Auth/Signup';
import Logout from 'screens/Auth/Logout';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import ResetPassword from 'screens/Auth/ResetPassword';
import AcceptInvite from 'screens/Auth/AcceptInvite';

function App() {
  return (
    <BasicLayout>
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/login/code" component={LoginCode} exact />
        <Route path="/logout" component={Logout} />
        <Route path="/accept-invite" component={AcceptInvite} exact />
        <Route path="/forgot-password" component={ForgotPassword} exact />
        <Route path="/reset-password" component={ResetPassword} exact />
        <Route path="*" component={Lockout} exact />
      </Switch>
    </BasicLayout>
  );
}

export default hot(App);
