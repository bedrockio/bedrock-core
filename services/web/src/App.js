import { hot } from 'react-hot-loader/root';
import 'theme/semantic.less';

import React from 'react';

import { Container } from 'semantic-ui-react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Header, Footer } from 'components';
import { AuthSwitch, Protected } from 'helpers/routes';

import {
  Docs,
  Dashboard,
  Settings,
  Invites,
  Users,
  Login,
  Shops,
  Logout,
  Signup,
  AcceptInvite,
  ForgotPassword,
  ResetPassword,
  NotFound,
} from 'screens';

const App = () => (
  <React.Fragment>
    <Header />
    <main>
      <Container>
        <Switch>
          <AuthSwitch path="/" loggedIn={Dashboard} loggedOut={Login} exact />
          <Protected path="/shops/:id?" allowed={Shops} />
          <Protected path="/settings" allowed={Settings} exact />
          <Protected path="/invites" allowed={Invites} exact />
          <Protected path="/users/:id?" allowed={Users} />
          <Protected path="/docs/:id?" allowed={Docs} />
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
      </Container>
    </main>
    <Footer />
  </React.Fragment>
);

export default hot(App);
