import { Route, Routes } from '@bedrockio/router';

import BasicLayout from 'layouts/Basic';

import AcceptInvite from 'screens/Auth/AcceptInvite';
import ConfirmCode from 'screens/Auth/ConfirmCode';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import Login from 'screens/Auth/Login';
import Logout from 'screens/Auth/Logout';
import ResetPassword from 'screens/Auth/ResetPassword';
import Signup from 'screens/Auth/Signup';
import Lockout from 'screens/Lockout';

export default function AuthApp() {
  return (
    <BasicLayout>
      <Routes>
        <Route path="/signup" render={Signup} />
        <Route path="/login" render={Login} />
        <Route path="/logout" render={Logout} />
        <Route path="/confirm-code" render={ConfirmCode} exact />
        <Route path="/accept-invite" render={AcceptInvite} exact />
        <Route path="/forgot-password" render={ForgotPassword} exact />
        <Route path="/reset-password" render={ResetPassword} exact />
        <Route path="*" render={Lockout} exact />
      </Routes>
    </BasicLayout>
  );
}
