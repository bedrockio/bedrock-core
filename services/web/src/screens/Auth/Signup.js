import React from 'react';
import { Form, Segment, Grid, Checkbox } from 'semantic';
import { Link } from 'react-router-dom';

import { withSession } from 'stores';

import screen from 'helpers/screen';

import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';
import PasswordField from 'components/form-fields/Password';
import Federated from 'components/Auth/Federated';

import { signupWithPasskey } from 'utils/passkey';
import { request } from 'utils/api';

const OTP_HIDDEN_FIELDS = ['password'];
const PASSKEY_HIDDEN_FIELDS = ['password'];
const FEDERATED_HIDDEN_FIELDS = ['email', 'password'];

@screen
@withSession
export default class PasswordSignup extends React.Component {
  static layout = 'basic';

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      accepted: false,
      touched: false,
      body: {
        ...props.location.state?.body,
      },
    };
  }

  componentDidMount() {
    if (this.context.isLoggedIn()) {
      this.props.history.push('/');
    }
  }

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

  getType() {
    return this.props.location.state?.type || 'password';
  }

  isOtp() {
    return this.getType() === 'otp';
  }

  isPasskey() {
    return this.getType() === 'passkey';
  }

  isFederated() {
    const type = this.getType();
    return type === 'google' || type === 'apple';
  }

  canRenderField(name) {
    if (this.isOtp()) {
      return !OTP_HIDDEN_FIELDS.includes(name);
    } else if (this.isFederated()) {
      return !FEDERATED_HIDDEN_FIELDS.includes(name);
    } else if (this.isPasskey()) {
      return !PASSKEY_HIDDEN_FIELDS.includes(name);
    }
    return true;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      touched: true,
      body: {
        ...this.state.body,
        [name]: value,
      },
    });
  };

  setAccepted = (evt, { checked }) => {
    this.setState({
      accepted: checked,
    });
  };

  getSignupPath() {
    return this.props.location.state?.path || '/1/auth/password/register';
  }

  signup = async (body) => {
    switch (this.getType()) {
      case 'password':
        return this.signupWithPassword(body);
      case 'passkey':
        return this.signupWithPasskey(body);
      case 'google':
        return this.signupWithGoogle(body);
      case 'apple':
        return this.signupWithApple(body);
      case 'otp':
        return this.signupWithOtp(body);
    }
  };

  signupWithPassword = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/auth/password/register',
      body,
    });
  };

  signupWithPasskey = async (body) => {
    return await signupWithPasskey(body);
  };

  signupWithGoogle = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/auth/google/register',
      body,
    });
  };

  signupWithApple = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/auth/apple/register',
      body,
    });
  };

  signupWithOtp = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/auth/otp/register',
      body,
    });
  };

  onSubmit = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { accepted, body } = this.state;
      if (!accepted) {
        throw new Error('Please accept the terms of service.');
      }
      const { data } = await this.signup(body);
      const next = await this.context.authenticate(data.token);
      this.props.history.push(next);
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { body, touched, accepted, error, loading } = this.state;
    return (
      <React.Fragment>
        <LogoTitle title="Create your account" />
        <Form size="large" loading={loading} onSubmit={this.onSubmit}>
          <Segment.Group>
            <Segment padded>
              {error?.type !== 'validation' && <ErrorMessage error={error} />}
              <Form.Input
                name="firstName"
                value={body.firstName || ''}
                placeholder="First Name"
                autoComplete="given-name"
                onChange={this.setField}
                error={error?.hasField?.('firstName')}
              />
              <Form.Input
                name="lastName"
                value={body.lastName || ''}
                placeholder="Last Name"
                autoComplete="family-name"
                onChange={this.setField}
                error={error?.hasField?.('lastName')}
              />
              {this.canRenderField('email') && (
                <EmailField
                  name="email"
                  value={body.email || ''}
                  onChange={this.setField}
                  error={error}
                />
              )}
              <PhoneField
                name="phone"
                value={body.phone || ''}
                onChange={this.setField}
                error={error}
              />
              {this.canRenderField('password') && (
                <PasswordField
                  name="password"
                  value={body.password || ''}
                  onChange={this.setField}
                  error={error}
                />
              )}
              <Form.Field error={touched && !accepted}>
                <Checkbox
                  name="accepted"
                  label={
                    <label>
                      I accept the <a href="/terms">Terms of Service</a>.
                    </label>
                  }
                  checked={accepted}
                  onChange={this.setAccepted}
                />
              </Form.Field>
              <Form.Button
                fluid
                primary
                size="large"
                content="Signup"
                loading={loading}
                disabled={loading}
              />

              {!this.isFederated() && (
                <React.Fragment>
                  <Federated
                    onVerifyStart={this.onVerifyStart}
                    onVerifyStop={this.onVerifyStop}
                  />
                </React.Fragment>
              )}
            </Segment>
            <Segment secondary>
              <Grid>
                <Grid.Column floated="left" width={12}>
                  Already have an account? <Link to="/login">Login</Link>
                </Grid.Column>
              </Grid>
            </Segment>
          </Segment.Group>
        </Form>
      </React.Fragment>
    );
  }
}
