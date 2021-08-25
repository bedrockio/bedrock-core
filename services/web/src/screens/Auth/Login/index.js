import React from 'react';
import { request } from 'utils/api';
import { Segment, Grid, Form, Message } from 'semantic';

import { withSession } from 'stores';
import { screen } from 'helpers';

import PageCenter from 'components/PageCenter';
import Logo from 'components/LogoTitle';

import { Link } from 'react-router-dom';

@screen
@withSession
export default class Login extends React.Component {
  static layout = 'none';

  state = {
    error: null,
    loading: false,
    email: '',
    password: '',
  };

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });

      const { data } = await request({
        method: 'POST',
        path: '/1/auth/login',
        body: {
          email: this.state.email,
          password: this.state.password,
        },
      });

      if (data.mfaRequired) {
        window.sessionStorage.setItem('mfa-auth', JSON.stringify(data));
        this.props.history.push('/mfa/verification');
        return;
      }

      this.props.history.push(this.context.authenticate(data.token));
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading, password, email } = this.state;

    return (
      <PageCenter>
        <Logo title="Login" />
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Form.Field error={error?.hasField?.('email')}>
                <Form.Input
                  value={email}
                  onChange={(e, { value }) => this.setState({ email: value })}
                  name="email"
                  icon="mail"
                  iconPosition="left"
                  placeholder="E-mail Address"
                  type="email"
                  autoComplete="email"
                />
              </Form.Field>
              <Form.Field error={error?.hasField?.('password')}>
                <Form.Input
                  value={password}
                  onChange={(e, { value }) =>
                    this.setState({ password: value })
                  }
                  name="password"
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  autoComplete="current-password"
                  type="password"
                />
              </Form.Field>
              <Form.Button
                fluid
                primary
                size="large"
                content="Login"
                loading={loading}
                disabled={loading}
              />
            </Form>
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
