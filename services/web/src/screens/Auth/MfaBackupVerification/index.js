import React from 'react';
import { request } from 'utils/api';
import { Segment, Form, Header, Message } from 'semantic';
import { withSession } from 'stores';
import screen from 'helpers/screen';
import { APP_SUPPORT_EMAIL } from 'utils/env';

import Logo from 'components/LogoTitle';
import { Link } from 'react-router-dom';

@screen
@withSession
export default class MfaBackupVerification extends React.Component {
  static layout = 'basic';

  state = {
    error: null,
    loading: false,
    code: '',
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
    const { mfaToken } = this.getMfaSessionData();

    this.setState({
      error: null,
      loading: true,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/mfa/send-code',
        token: mfaToken,
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
        path: '/1/mfa/verify',
        token,
        body: {
          code: this.state.code,
        },
      });
      await this.context.authenticate(data.token);
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading } = this.state;

    return (
      <React.Fragment>
        <Logo title="Two-Step Verification" />
        <Segment.Group>
          <Segment padded>
            <Form error={!!error} size="large" onSubmit={this.onSubmit}>
              <Header>Use Your Backup Codes</Header>
              {error && <Message error content={error.message} />}
              <p>Please enter one of your unused backup verification codes:</p>
              <Form.Input
                value={this.state.code}
                onChange={(e, { value }) => this.setState({ code: value })}
                name="code"
                placeholder="Backup verification code"
              />
              <Form.Button
                fluid
                primary
                size="large"
                content="Sign In"
                loading={loading}
                disabled={loading}
              />
              <p>
                Don't have your backup codes anymore? Contact support at{' '}
                <a href={`mailto:${APP_SUPPORT_EMAIL}`}>{APP_SUPPORT_EMAIL}</a>{' '}
                to start a manual verification process.
              </p>
              <p></p>
            </Form>
          </Segment>
          <Segment secondary>
            <Link to="/login/verification">Back to verification</Link>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}
