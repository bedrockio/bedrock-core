import { hot } from 'react-hot-loader/root';
import { Switch, Route } from 'react-router-dom';

import BasicLayout from 'layouts/Basic';

import Lockout from 'screens/Lockout';

import Login from 'screens/Auth/Login';
import Logout from 'screens/Auth/Logout';
import Signup from 'screens/Auth/Signup';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import ResetPassword from 'screens/Auth/ResetPassword';
import AcceptInvite from 'screens/Auth/AcceptInvite';
import ConfirmCode from 'screens/Auth/ConfirmCode';

function App() {
  return (
    <BasicLayout>
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/logout" component={Logout} />
        <Route path="/confirm-code" component={ConfirmCode} exact />
        <Route path="/accept-invite" component={AcceptInvite} exact />
        <Route path="/forgot-password" component={ForgotPassword} exact />
        <Route path="/reset-password" component={ResetPassword} exact />
        <Route path="*" component={Lockout} exact />
      </Switch>
    </BasicLayout>
  );
}

export default hot(App);
