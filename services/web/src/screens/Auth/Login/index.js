import React from 'react';
import { request } from 'utils/api';
import { Segment, Grid } from 'semantic';
import { withSession } from 'stores';
import { screen } from 'helpers';

import PageCenter from 'components/PageCenter';
import Logo from 'components/LogoTitle';

import LoginForm from './LoginForm';
import MFAForm from './MFAForm';
import { Link } from 'react-router-dom';

@screen
@withSession
export default class Login extends React.Component {
  static layout = 'none';

  state = {
    error: null,
    loading: false,
    view: 'login',
    mfaToken: null,
    mfaMethod: null,
  };

  onLoginSubmit = async (body) => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/login',
        body,
      });

      if (data.mfaRequired) {
        this.setState({
          mfaToken: data.token,
          mfaMethod: data.mfaRequired,
          view: 'mfa',
        });
        return;
      }

      this.context.setToken(data.token);
      await this.context.load();
      this.props.history.push('/');
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onMFASubmit = async ({ code }) => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/login',
        token: this.state.mfaToken,
        body: {
          code,
        },
      });

      this.context.setToken(data.token);
      await this.context.load();
      this.props.history.push('/');
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading, view } = this.state;
    return (
      <PageCenter>
        <Logo title="Login" />
        <Segment.Group>
          <Segment padded>
            {view === 'login' && (
              <LoginForm
                onSubmit={this.onLoginSubmit}
                error={error}
                loading={loading}
              />
            )}
            {view === 'mfa' && (
              <MFAForm
                onSubmit={this.onMFASubmit}
                error={error}
                loading={loading}
              />
            )}
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/signup">Signup</Link>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/forgot-password">Forgot Password</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
