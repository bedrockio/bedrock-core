import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Grid, Form } from 'semantic';

import { withSession } from 'stores';

import screen from 'helpers/screen';

import Logo from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import Federated from 'components/Auth/Federated';

import { request } from 'utils/api';

@screen
@withSession
export default class EmailOtpLogin extends React.Component {
  static layout = 'basic';
  static title = 'Login';

  state = {
    email: '',
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

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { email } = this.state;
      await request({
        method: 'POST',
        path: '/1/auth/otp/send-code',
        body: {
          email,
        },
      });
      this.props.history.push('/login/code', {
        type: 'otp',
        email,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onSignupClick = (evt) => {
    evt.preventDefault();
    this.props.history.push('/signup', {
      type: 'otp',
    });
  };

  render() {
    const { email, error, loading } = this.state;
    return (
      <React.Fragment>
        <Logo title="Login" />
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={this.onSubmit}>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              <EmailField
                name="email"
                error={error}
                value={email}
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
            </Form>
            <Federated />
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/signup" onClick={this.onSignupClick}>
                  Signup
                </Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}
