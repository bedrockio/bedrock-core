import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Grid, Form, Message } from 'semantic';

import { withSession } from 'contexts/session';

import screen from 'helpers/screen';

import Logo from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PasswordField from 'components/form-fields/Password';
import Federated from 'components/Auth/Federated';

import { request } from 'utils/api';

@screen
@withSession
export default class PasswordLogin extends React.Component {
  static layout = 'basic';

  state = {
    email: '',
    password: '',
    error: null,
    loading: false,
  };

  componentDidMount() {
    if (this.context.isLoggedIn()) {
      this.props.history.push('/');
    }
  }

  setField = (evt, { name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  onVerifyStart = () => {
    this.setState({
      loading: true,
    });
  };

  onVerifyStop = () => {
    this.setState({
      loading: false,
    });
  };

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { email, password } = this.state;
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/password/login',
        body: {
          email,
          password,
        },
      });
      if (data.next) {
        this.props.history.push('/login/code', data.next);
      } else {
        const next = await this.context.authenticate(data.token);
        this.props.history.push(next);
      }
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
      <React.Fragment>
        <Logo title="Login" />
        <Form
          size="large"
          error={!!error}
          loading={loading}
          onSubmit={this.onSubmit}>
          <Segment.Group>
            <Segment padded>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              <EmailField
                name="email"
                error={error}
                value={email}
                onChange={this.setField}
              />
              <PasswordField
                current
                name="password"
                error={error}
                value={password}
                onChange={this.setField}
              />
              <Form.Button
                fluid
                primary
                size="large"
                content="Login"
                loading={loading}
                disabled={loading}
              />
              <Federated
                onVerifyStart={this.onVerifyStart}
                onVerifyStop={this.onVerifyStop}
              />
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
        </Form>
      </React.Fragment>
    );
  }

  renderFieldErrors(error, name) {
    if (error) {
      const details = error.getFieldDetails?.(name);
      if (details) {
        return (
          <React.Fragment>
            <Message size="small" error>
              <Message.Content>
                {details.map((d, i) => {
                  return <div key={i}>{d.message}</div>;
                })}
              </Message.Content>
            </Message>
          </React.Fragment>
        );
      }
    }
  }
}
