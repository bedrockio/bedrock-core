import React from 'react';
import { request } from 'utils/api';
import { Segment, Form, Header, Message, Divider } from 'semantic';
import { withSession } from 'stores';
import screen from 'helpers/screen';

import PageCenter from 'components/PageCenter';
import Logo from 'components/LogoTitle';
import { Link } from 'react-router-dom';
import Code from 'components/form-fields/Code';

import { Layout } from 'components';

@screen
@withSession
export default class MfaVerification extends React.Component {
  static layout = 'none';

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
    const { token } = this.getMfaSessionData();

    this.setState({
      error: null,
      loading: true,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/mfa/send-code',
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
    const { mfaToken } = this.getMfaSessionData();
    this.setState({
      error: null,
      loading: true,
    });

    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/mfa/verify',
        token: mfaToken,
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
            <Header>Two-factor Verification</Header>
            {error && <Message error content={error.message} />}
            {mfaSessionData.mfaMethod === 'otp' && (
              <React.Fragment>
                <p>
                  Enter the security code displayed by your authenticator app.
                </p>
                <Divider hidden />
                <Layout center>
                  <Code
                    className="verification-code"
                    type="number"
                    fields={6}
                    loading={loading}
                    onChange={(value) => this.setState({ code: value })}
                    onComplete={(value) => {
                      this.setState({ code: value }, () => {
                        this.onSubmit();
                      });
                    }}
                  />
                </Layout>
                <Divider hidden />
              </React.Fragment>
            )}
            {mfaSessionData.mfaMethod === 'sms' && (
              <>
                <p>
                  For added security, please enter the code that has been sent
                  to your phone number ending in {mfaSessionData.mfaPhoneNumber}
                </p>
                <Divider hidden />
                <Layout center>
                  <Code
                    className="verification-code"
                    type="number"
                    fields={6}
                    loading={loading}
                    onChange={(value) => this.setState({ code: value })}
                    onComplete={(value) => {
                      this.setState({ code: value }, () => {
                        this.onSubmit();
                      });
                    }}
                  />
                </Layout>
                <Divider hidden />

                <p>
                  It may take a minute to arrive.{' '}
                  <a onClick={this.triggerToken} style={{ cursor: 'pointer' }}>
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
              onClick={this.onSubmit}
            />
          </Segment>
          <Segment secondary>
            Is this authentication method not working?{' '}
            <Link to="/login/verification/backup">Use your backup codes</Link>.
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
