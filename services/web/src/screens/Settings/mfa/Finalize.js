import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Segment, Header, Form, Message } from 'semantic';

import { request } from 'utils/api';
import { APP_NAME } from 'utils/env';
import { withSession } from 'stores';
import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';

@withRouter
@withSession
export default class Finalize extends React.Component {
  static layout = 'basic';

  state = {
    loading: false,
    error: null,
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
        path: '/1/mfa/enable',
        body: this.props.requestBody,
      });
      await this.context.bootstrap();
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
      <React.Fragment>
        <LogoTitle title="Save your recovery codes" />
        <Segment.Group>
          <Segment>
            <Header size="small">Two-factor recovery codes</Header>
            <p>
              Recovery codes can be used to access your account in the event you
              lose access to your device and cannot receive two-factor
              authentication codes.
            </p>
          </Segment>
          <ErrorMessage error={error} />
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
                  I understand that {APP_NAME} cannot give me access to my
                  account if I lose my backup codes and access to my
                  authentication methods.
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
      </React.Fragment>
    );
  }
}
