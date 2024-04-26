import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Grid, Form } from 'semantic';

import { withSession } from 'stores';

import screen from 'helpers/screen';

import Logo from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';
import Federated from 'components/Auth/Federated';

import { request } from 'utils/api';

@screen
@withSession
export default class PhoneOtpLogin extends React.Component {
  static layout = 'basic';
  static title = 'Login';

  state = {
    phone: '',
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

  onSubmitLogin = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { phone } = this.state;
      await request({
        method: 'POST',
        path: '/1/auth/otp/send-code',
        body: {
          phone,
        },
      });

      this.props.history.push('/login/code', {
        type: 'otp',
        phone,
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
    const { phone, error, loading } = this.state;
    return (
      <React.Fragment>
        <Logo title="Login" />
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={this.onSubmitLogin}>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              <PhoneField
                name="phone"
                error={error}
                value={phone}
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
