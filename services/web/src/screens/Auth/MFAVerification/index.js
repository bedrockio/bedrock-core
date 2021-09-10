import React from 'react';
import { request } from 'utils/api';
import { Segment, Form, Header, Message } from 'semantic';
import { withSession } from 'stores';
import { screen } from 'helpers';

import PageCenter from 'components/PageCenter';
import Logo from 'components/LogoTitle';

@screen
@withSession
export default class Login extends React.Component {
  static layout = 'none';

  state = {
    error: null,
    loading: false,
  };

  componentDidMount() {
    const data = this.getMfaSessionData();
    if (!data) {
      this.props.history.push('/login');
      return;
    }
    if (data.mfaMethod === 'sms') {
      this.triggerToken();
    }
  }

  getMfaSessionData() {
    const data = window.sessionStorage.getItem('mfa-auth');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  triggerToken = async () => {
    const { token } = this.getMfaSessionData();

    this.setState({
      error: null,
      loading: true,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/auth/mfa/send-token',
        token,
      });
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

  onSubmit = async () => {
    const { token } = this.getMfaSessionData();
    this.setState({
      error: null,
      loading: true,
    });

    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/mfa/verify',
        token,
        body: {
          code: this.state.code,
        },
      });

      this.props.history.push(this.context.authenticate(data.token));
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading } = this.state;
    const mfaSessionData = this.getMfaSessionData() || {};

    return (
      <PageCenter>
        <Logo title="Two-Step Verification" />
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={this.onSubmit}>
              <Header>Two-factor Verification</Header>
              {error && <Message error content={error.message} />}
              {mfaSessionData.mfaMethod === 'otp' && (
                <Form.Input
                  value={this.state.code}
                  onChange={(e, { value }) => this.setState({ code: value })}
                  name="code"
                  placeholder="Enter the security code displayed by your app."
                />
              )}
              {mfaSessionData.mfaMethod === 'sms' && (
                <>
                  <p>
                    For added security, please enter the code that has been sent
                    to your phone number ending in{' '}
                    {mfaSessionData.mfaPhoneNumber}
                  </p>

                  <Form.Input
                    value={this.state.code}
                    onChange={(e, { value }) => this.setState({ code: value })}
                    name="code"
                    placeholder="Enter the six-digit code sent to your phone"
                  />

                  <p>
                    It may take a minute to arrive.{' '}
                    <a
                      onClick={this.triggerToken}
                      style={{ cursor: 'pointer' }}>
                      Send again?
                    </a>
                  </p>
                </>
              )}
              <Form.Button
                fluid
                primary
                size="large"
                content="Sign In"
                loading={loading}
                disabled={loading}
              />
              <p>Can’t receive your code? Enter a backup code above.</p>
            </Form>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
