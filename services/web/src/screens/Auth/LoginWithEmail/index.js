import React from 'react';
import { request } from 'utils/api';
import { Segment, Grid, Form, Message } from 'semantic';

import { withSession } from 'stores';
import screen from 'helpers/screen';

import PageCenter from 'components/PageCenter';
import Logo from 'components/LogoTitle';
import { Layout } from 'components';

import { Link } from 'react-router-dom';
import Code from 'components/form-fields/Code';

@screen
@withSession
export default class Login extends React.Component {
  static layout = 'none';

  state = {
    error: null,
    loading: false,
    email: '',
    code: '',
    showConfirm: true,
  };

  handleEmailSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });

      await request({
        method: 'POST',
        path: '/1/auth/login/email',
        body: {
          email: this.state.email,
        },
      });
      this.setState({
        showConfirm: true,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  handleOnConfirm = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });

      const { data } = await request({
        method: 'POST',
        path: '/1/auth/login/email/confirm',
        body: {
          email: this.state.email,
          code: this.state.code,
        },
      });

      if (data.mfaRequired) {
        window.sessionStorage.setItem('mfa-auth', JSON.stringify(data));
        this.props.history.push('/login/verification');
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
    const { error, loading, email, showConfirm } = this.state;

    return (
      <PageCenter>
        <Logo title="Login" />
        {showConfirm && (
          <Segment padded>
            {error && <Message error content={error.message} />}
            <Layout center>
              <Code
                isNumeric={false}
                className="verification-code"
                type="number"
                autoFocus
                fields={6}
                loading={loading}
                onChange={(value) => this.setState({ code: value })}
                onComplete={(value) => {
                  this.setState({ code: value }, () => {
                    this.handleOnConfirm();
                  });
                }}
              />
            </Layout>
          </Segment>
        )}
        {!showConfirm && (
          <Segment.Group>
            <Segment padded>
              <Form
                error={!!error}
                size="large"
                onSubmit={this.handleEmailSubmit}>
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
        )}
      </PageCenter>
    );
  }
}
