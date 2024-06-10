import React from 'react';
import {
  Segment,
  Divider,
  Message,
  Header,
  Form,
  Button,
  Dimmer,
  Loader,
} from 'semantic';

import { withSession } from 'stores';

import screen from 'helpers/screen';

import Layout from 'components/Layout';
import ErrorMessage from 'components/ErrorMessage';
import GoogleSignInButton from 'components/Auth/Google/SignInButton';
import GoogleDisableButton from 'components/Auth/Google/DisableButton';
import AppleSignInButton from 'components/Auth/Apple/SignInButton';
import AppleDisableButton from 'components/Auth/Apple/DisableButton';

import { enablePasskey, disablePasskey } from 'utils/passkey';

import { request } from 'utils/api';

import Menu from './Menu';

@screen
@withSession
export default class SignIn extends React.Component {
  state = {
    error: null,
    loading: false,
    message: null,
    mfaMethod: null,
  };

  componentDidMount() {
    // TODO
    if (
      Date.parse(this.context.user.accessConfirmedAt) <
      Date.now() - 20 * 60 * 1000
    ) {
      this.props.history.push(
        `/confirm-access?to=${this.props.location.pathname}`
      );
    }
    this.setState({
      mfaMethod: this.context.user.mfaMethod,
    });
  }

  // Federated

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

  onGoogleEnabled = () => {
    this.setState({
      message: 'Enabled Google Sign-In',
    });
  };

  onGoogleDisabled = () => {
    this.setState({
      message: 'Disabled Google Sign-In',
    });
  };

  onAppleEnabled = () => {
    this.setState({
      message: 'Enabled Apple Sign-In',
    });
  };

  onAppleDisabled = () => {
    this.setState({
      message: 'Disabled Apple Sign-In',
    });
  };

  // Passkey

  onEnablePasskeyClick = async () => {
    try {
      this.setState({
        error: null,
        message: null,
        loading: true,
      });
      const { data } = await enablePasskey();
      this.context.updateUser(data);
      this.setState({
        loading: false,
        message: 'Passkey enabled',
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onDisablePasskeyClick = async () => {
    try {
      this.setState({
        error: null,
        message: null,
        loading: true,
      });
      const { data } = await disablePasskey();
      this.context.updateUser(data);
      this.setState({
        loading: false,
        message: 'Passkey disabled',
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  // MFA

  hasTotp() {
    const { authenticators } = this.context.user;
    return authenticators.some((authenticator) => {
      return authenticator.type === 'totp';
    });
  }

  hasAuthenticator(type) {
    const { user } = this.context;
    return user.authenticators.find((authenticator) => {
      return authenticator.type === type;
    });
  }

  removeTotp = async () => {
    try {
      this.setState({
        error: null,
        message: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/totp/disable',
      });
      this.context.updateUser(data);
      this.setState({
        mfaMethod: this.context.user.mfaMethod,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onMfaMethodChange = async (evt, { value }) => {
    if (value === 'totp' && !this.hasTotp()) {
      this.props.history.push('/settings/authenticator');
    } else {
      try {
        this.setState({
          error: null,
          message: null,
          loading: true,
        });
        const { data } = await request({
          method: 'PATCH',
          path: '/1/auth/mfa-method',
          body: {
            method: value,
          },
        });
        this.context.updateUser(data);
        this.setState({
          loading: false,
          message: this.getMfaMessage(value),
          mfaMethod: value,
        });
      } catch (error) {
        this.setState({
          error,
          loading: false,
        });
      }
    }
  };

  getMfaMessage(method) {
    if (method === 'none') {
      return 'Two-factor authentication disabled.';
    } else {
      return 'Two-factor authentication enabled.';
    }
  }

  render() {
    const { loading, error, message } = this.state;

    return (
      <React.Fragment>
        <Menu />
        {loading && (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        )}
        <Divider hidden />
        {message && <Message info content={message} />}
        <Segment>
          <Header>Sign in with Google</Header>
          {this.renderGoogle()}
          <Divider hidden />
          <Header>Sign in with Apple</Header>
          {this.renderApple()}
          <Divider hidden />
          <Header>Passkey</Header>
          {this.renderPasskey()}
          <Divider hidden />
          <Header>Two-factor authentication</Header>
          {this.renderMfa()}
          <ErrorMessage error={error} />
        </Segment>
      </React.Fragment>
    );
  }

  renderGoogle() {
    if (this.hasAuthenticator('google')) {
      return (
        <Layout horizontal center spread>
          <Layout.Group>Enabled</Layout.Group>
          <GoogleDisableButton onDisabled={this.onGoogleDisabled} />
        </Layout>
      );
    } else {
      return (
        <Layout horizontal center spread>
          <Layout.Group>Disabled</Layout.Group>
          <GoogleSignInButton
            onComplete={this.onGoogleEnabled}
            onVerifyStart={this.onVerifyStart}
            onVerifyStop={this.onVerifyStop}
          />
        </Layout>
      );
    }
  }

  renderApple() {
    if (this.hasAuthenticator('apple')) {
      return (
        <Layout horizontal center spread>
          <Layout.Group>Enabled</Layout.Group>
          <AppleDisableButton onDisabled={this.onAppleDisabled} />
        </Layout>
      );
    } else {
      return (
        <Layout horizontal center spread>
          <Layout.Group>Disabled</Layout.Group>
          <AppleSignInButton
            onComplete={this.onAppleEnabled}
            onVerifyStart={this.onVerifyStart}
            onVerifyStop={this.onVerifyStop}
          />
        </Layout>
      );
    }
  }

  renderPasskey() {
    const { loading } = this.state;
    if (this.hasAuthenticator('passkey')) {
      return (
        <Layout horizontal center spread>
          <Layout.Group>Enabled</Layout.Group>
          <Button
            color="red"
            size="small"
            content="Disable"
            loading={loading}
            onClick={this.onDisablePasskeyClick}
          />
        </Layout>
      );
    } else {
      return (
        <Layout horizontal center spread>
          <Layout.Group>Disabled</Layout.Group>
          <Button
            size="small"
            content="Enable"
            loading={loading}
            onClick={this.onEnablePasskeyClick}
          />
        </Layout>
      );
    }
  }

  renderMfa() {
    const { mfaMethod } = this.state;
    return (
      <React.Fragment>
        <Layout horizontal center spread>
          <Layout.Group>
            {mfaMethod === 'none' ? 'Disabled' : 'Enabled'}
          </Layout.Group>
          <Form>
            <Form.Dropdown
              selection
              size="small"
              value={mfaMethod}
              onChange={this.onMfaMethodChange}
              options={[
                {
                  text: 'None',
                  value: 'none',
                },
                {
                  text: 'SMS',
                  value: 'sms',
                },
                {
                  text: 'Email',
                  value: 'email',
                },
                {
                  text: 'Authenticator',
                  value: 'totp',
                },
              ]}
            />
          </Form>
        </Layout>
        {this.renderMfaAuthenticator()}
      </React.Fragment>
    );
  }

  renderMfaAuthenticator() {
    const { loading } = this.state;
    if (!this.hasTotp()) {
      return;
    }
    return (
      <React.Fragment>
        <Divider hidden></Divider>
        <Layout horizontal center spread>
          <div>You have registered an authenticator with this account.</div>
          <Button
            onClick={this.removeTotp}
            loading={loading}
            size="small"
            color="red">
            Remove
          </Button>
        </Layout>
      </React.Fragment>
    );
  }
}
