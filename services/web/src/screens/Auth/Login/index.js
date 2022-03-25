import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Grid, Form } from 'semantic';
import { request } from 'utils/api';
import { withSession } from 'stores';
import screen from 'helpers/screen';

import Logo from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';

@screen
@withSession
export default class Login extends React.Component {
  static layout = 'basic';

  state = {
    error: null,
    loading: false,
    email: '',
    password: '',
  };

  componentDidMount() {
    if (this.context.isLoggedIn()) {
      this.props.history.push('/');
    }
  }

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const body = {
        email: this.state.email,
        password: this.state.password,
      };
      this.props.history.push(await this.context.login(body));
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
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={this.onSubmit}>
              <ErrorMessage error={error} />
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
      </React.Fragment>
    );
  }
}
