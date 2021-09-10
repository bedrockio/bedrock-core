import React from 'react';
import { Button, Segment, Header, Form, Message } from 'semantic';
import { request } from 'utils/api';

import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import { withRouter } from 'react-router-dom';

@withRouter
export default class Finalize extends React.Component {
  state = {
    loading: false,
    error: undefined,
    savedCodes: false,
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
      touched: true,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/users/me/mfa/enable',
        body: this.props.requestBody,
      });
      this.props.history.push(`/settings/security`);
    } catch (error) {
      if (error.status == 403) {
        this.props.history.push('/confirm-access?to=/settings/mfa-sms');
        return;
      }

      this.setState({
        error,
        loading: false,
      });
    }
  };

  getDownloadLink(text) {
    const data = new Blob([text], { type: 'text/plain' });
    return window.URL.createObjectURL(data);
  }

  render() {
    const { loading, error } = this.state;

    const codesStr = this.props.codes.reduce((str, current, index) => {
      return str + current + (index % 2 ? '\n' : '     ');
    }, '');

    return (
      <PageCenter>
        <LogoTitle title="Save your backup codes" />

        <Segment.Group>
          <Segment>
            <Header size="small">Backup codes</Header>
            <p>
              If you lose access to your authentication method, backup codes can
              be used to access your account. Each code can only be used once.
            </p>
          </Segment>

          {error && <Message error content={error.message} />}

          <Segment>
            <Button
              as={'a'}
              download="backup-codes.txt"
              href={this.getDownloadLink(codesStr)}
              basic>
              Download
            </Button>
            <Button
              basic
              onClick={() => navigator.clipboard.writeText(codesStr)}>
              Copy
            </Button>
            <div
              style={{
                backgroundColor: '#f9f9f9',
                padding: '0.5em',
                marginTop: '0.5em',
              }}>
              <pre
                style={{
                  fontSize: '18px',
                  borderRadius: '3px',
                  padding: '1em',
                  textAlign: 'center',
                }}>
                {codesStr}
              </pre>
            </div>
          </Segment>
          <Segment>
            <Form>
              <Form.Checkbox
                checked={this.state.savedCodes}
                label="I saved my backup codes."
                onChange={(e, { checked }) =>
                  this.setState({ savedCodes: checked })
                }
              />
              {this.props.method !== 'sms' && (
                <Message warning>
                  I understand that Postmark cannot give me access to my account
                  if I lose my backup codes and access to my authentication
                  methods.
                </Message>
              )}
              {this.props.method === 'sms' && (
                <Message warning>
                  Put these in a safe spot. If you lose your device and don’t
                  have the recovery codes you will lose access to your account.
                </Message>
              )}
            </Form>
          </Segment>

          <Segment>
            <Button
              onClick={this.onSubmit}
              primary
              loading={loading}
              disabled={!this.state.savedCodes || loading}
              content={'Enable two-factor authentication'}
            />
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
