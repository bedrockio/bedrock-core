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

import { withSession } from 'stores/session';

import Meta from 'components/Meta';
import Layout from 'components/Layout';
import ErrorMessage from 'components/ErrorMessage';
import AppleDisableButton from 'components/Auth/Apple/DisableButton';
import GoogleDisableButton from 'components/Auth/Google/DisableButton';

import { createPasskey, removePasskey } from 'utils/auth/passkey';
import { formatDate, fromNow } from 'utils/date';

import { request } from 'utils/api';

import Menu from './Menu';

class Security extends React.Component {
  state = {
    error: null,
    loading: false,
    message: null,
  };

  // Federated

  onGoogleEnabled = () => {
    this.setState({
      message: 'Enabled Google Login',
    });
  };

  onGoogleDisabled = () => {
    this.setState({
      message: 'Disabled Google Login',
    });
  };

  onAppleEnabled = () => {
    this.setState({
      message: 'Enabled Apple Login',
    });
  };

  onAppleDisabled = () => {
    this.setState({
      message: 'Disabled Apple Login',
    });
  };

  // Passkey

  onCreatePasskeyClick = async () => {
    try {
      this.setState({
        error: null,
        message: null,
        loading: true,
      });
      const result = await createPasskey();
      if (result) {
        const { data } = result;
        this.context.updateUser(data);
        this.setState({
          message: 'Passkey enabled',
        });
      }
      this.setState({
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  deletePasskey = async (passkey) => {
    try {
      this.setState({
        error: null,
        message: null,
        loading: true,
      });
      const { data } = await removePasskey(passkey);
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

  getAuthenticators(type) {
    const { user } = this.context;
    return user.authenticators.filter((authenticator) => {
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
        <Meta title="Security" />
        <Menu />
        {loading && (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        )}
        <Divider hidden />
        {message && <Message info content={message} />}
        <Segment>
          <ErrorMessage error={error} />
          <Header>Google</Header>
          {this.renderGoogle()}
          <Divider hidden />
          <Header>Apple</Header>
          {this.renderApple()}
          <Divider hidden />
          <Header>
            <span>Passkeys</span>
            <Button
              basic
              icon="plus"
              circular
              style={{
                fontSize: '22px',
                display: 'inline-flex',
                alignItems: 'center',
                verticalAlign: 'baseline',
                padding: '0',
              }}
              onClick={this.onCreatePasskeyClick}
            />
          </Header>
          {this.renderPasskeys()}
          <Divider hidden />
          <Header>Two-factor authentication</Header>
          {this.renderMfa()}
        </Segment>
      </React.Fragment>
    );
  }

  renderGoogle() {
    return (
      <div>
        {this.hasAuthenticator('google') ? (
          <GoogleDisableButton onDisabled={this.onGoogleDisabled} />
        ) : (
          <div>Sign in with Google to enable.</div>
        )}
      </div>
    );
  }

  renderApple() {
    return (
      <div>
        {this.hasAuthenticator('apple') ? (
          <AppleDisableButton onDisabled={this.onAppleDisabled} />
        ) : (
          <div>Sign in with Apple to enable.</div>
        )}
      </div>
    );
  }

  renderPasskeys() {
    const { loading } = this.state;
    const passkeys = this.getAuthenticators('passkey');

    if (passkeys.length) {
      return passkeys.map((passkey) => {
        const { id, name, createdAt, lastUsedAt } = passkey;
        return (
          <React.Fragment key={id}>
            <Layout horizontal center spread>
              <Layout.Group>
                <Header size="small">{name}</Header>
              </Layout.Group>
              <Layout.Group>
                <Button
                  negative
                  size="mini"
                  icon="trash"
                  onClick={() => {
                    this.deletePasskey(passkey);
                  }}
                />
              </Layout.Group>
            </Layout>
            <div>
              <span>Added on {formatDate(createdAt)}</span>
              <span> | </span>
              <span>Last used {fromNow(lastUsedAt)}</span>
            </div>
          </React.Fragment>
        );
        // Added on Jan 27, 2025 | Last used 2 days ago
      });
    } else {
      return (
        <Button
          basic
          size="small"
          content="Enable"
          loading={loading}
          onClick={this.onCreatePasskeyClick}
        />
      );
    }
  }

  renderMfa() {
    const { mfaMethod } = this.context.user;
    return (
      <React.Fragment>
        <Layout horizontal>
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

export default withSession(Security);
