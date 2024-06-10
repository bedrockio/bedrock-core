import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Segment, Header, Divider } from 'semantic';

import screen from 'helpers/screen';

import Layout from 'components/Layout';
import LogoTitle from 'components/LogoTitle';
import Code from 'components/form-fields/Code';
import ErrorMessage from 'components/ErrorMessage';

import PhoneNumber from 'components/PhoneNumber';

import { request } from 'utils/api';

import Finalize from './Finalize';

@screen
export default class Sms extends React.Component {
  static layout = 'basic';

  state = {
    touched: false,
    loading: false,
    error: null,
    phoneNumber: '',
    code: '',
    smsSent: false,
  };

  triggerSms = async () => {
    const { phoneNumber } = this.state;
    this.setState({
      smsSent: false,
      error: null,
      smsLoading: true,
    });

    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/mfa/setup',
        body: {
          method: 'sms',
          phoneNumber,
        },
      });

      this.setState({
        secret: data.secret,
        smsSent: true,
        smsLoading: false,
      });
    } catch (error) {
      if (error.status == 403) {
        this.props.history.push('/confirm-access?to=/settings/mfa-sms');
        return;
      }

      this.setState({
        error: error,
        smsLoading: false,
      });
    }
  };

  onVerify = async () => {
    this.setState({
      loading: true,
      touched: true,
      error: null,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/mfa/check-code',
        body: {
          code: this.state.code,
          secret: this.state.secret,
          method: 'sms',
        },
      });

      const { data } = await request({
        method: 'POST',
        path: '/1/mfa/generate-backup-codes',
      });

      this.setState({
        verified: true,
        codes: data.codes,
      });
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

  render() {
    const {
      touched,
      loading,
      error,

      phoneNumber,
      code,
      codes,
      secret,
      verified,
    } = this.state;

    if (verified) {
      return (
        <Finalize
          method="sms"
          requestBody={{
            secret,
            method: 'sms',
            phoneNumber,
            backupCodes: codes,
          }}
          codes={codes}
        />
      );
    }

    return (
      <React.Fragment>
        <LogoTitle title="Set up SMS authentication" />
        <Segment.Group>
          <Segment>
            <Header size="small">1. What’s your mobile phone number?</Header>
            <p>Authentication codes will be sent to it.</p>
            <Form onSubmit={this.triggerSms} error={touched && !!error}>
              <ErrorMessage error={error} />

              <Form.Field>
                <label>Phone Number</label>
                <PhoneNumber
                  value={phoneNumber}
                  label="Phone number"
                  required
                  onChange={(e, { value }) =>
                    this.setState({ phoneNumber: value })
                  }
                />
              </Form.Field>

              <Layout horizontal center>
                <Form.Button
                  type="submit"
                  basic
                  disabled={!phoneNumber}
                  loading={this.state.smsLoading}>
                  Send authentication Code
                </Form.Button>
                {this.state.smsSent && (
                  <div style={{ height: '28px', paddingLeft: '10px' }}>
                    It may take a minute to arrive.{' '}
                  </div>
                )}
              </Layout>
            </Form>
          </Segment>
          <Segment>
            <Header size="small">
              2. Enter the security code sent to your device
            </Header>
            <p> It may take a minute to arrive.</p>
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
                    this.onVerify();
                  });
                }}
              />
            </Layout>
            <Divider hidden />
          </Segment>
          <Segment>
            <Button
              form="authenticator-form"
              primary
              loading={loading}
              disabled={loading || code.length !== 6}
              onClick={this.onVerify}
              content={'Verify'}
            />
            <Button
              as={Link}
              to="/settings/security"
              basic
              floated="right"
              secondary
              content={'Cancel'}
            />
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}
