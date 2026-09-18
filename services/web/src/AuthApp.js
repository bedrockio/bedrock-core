import { Route, Routes } from '@bedrockio/router';

import BasicLayout from 'layouts/Basic';
import SplitAuthLayout from 'layouts/SplitAuth';

import AcceptInvite from 'screens/Auth/AcceptInvite';
import ConfirmCode from 'screens/Auth/ConfirmCode';
import ForgotPassword from 'screens/Auth/ForgotPassword';
import Login from 'screens/Auth/Login';
import Logout from 'screens/Auth/Logout';
import ResetPassword from 'screens/Auth/ResetPassword';
import Signup from 'screens/Auth/Signup';
import Lockout from 'screens/Lockout';

function withLayout(Layout, Screen) {
  return function LayoutWrapped(props) {
    return (
      <Layout>
        <Screen {...props} />
      </Layout>
    );
  };
}

export default function AuthApp() {
  return (
    <Routes>
      <Route path="/signup" render={withLayout(SplitAuthLayout, Signup)} />
      <Route path="/login" render={withLayout(SplitAuthLayout, Login)} />
      <Route path="/logout" render={withLayout(BasicLayout, Logout)} />
      <Route
        path="/confirm-code"
        render={withLayout(BasicLayout, ConfirmCode)}
        exact
      />
      <Route
        path="/accept-invite"
        render={withLayout(BasicLayout, AcceptInvite)}
        exact
      />
      <Route
        path="/forgot-password"
        render={withLayout(SplitAuthLayout, ForgotPassword)}
        exact
      />
      <Route
        path="/reset-password"
        render={withLayout(SplitAuthLayout, ResetPassword)}
        exact
      />
      <Route path="*" render={withLayout(BasicLayout, Lockout)} exact />
    </Routes>
  );
}
