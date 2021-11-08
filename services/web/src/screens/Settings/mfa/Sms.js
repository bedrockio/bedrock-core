import React from 'react';
import { Form, Message, Button, Segment, Header, Divider } from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import allCountries from 'utils/countries';

import Finalize from './Finalize';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import { Link } from 'react-router-dom';
import Code from 'components/form-fields/Code';
import { Layout } from 'components';

const countryCallingCodes = allCountries.map(({ nameEn, callingCode }) => ({
  value: nameEn,
  text: `${nameEn} (+${callingCode})`,
  key: `${nameEn}-${callingCode}`,
}));

@screen
export default class Sms extends React.Component {
  static layout = 'none';

  state = {
    touched: false,
    loading: false,
    error: null,
    phoneNumber: '',
    country: '',
    code: '',
    smsSent: false,
  };

  triggerSms = async () => {
    const { country, phoneNumber } = this.state;
    this.setState({
      smsSent: false,
      error: null,
    });
    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/mfa/setup',
        body: {
          method: 'sms',
          phoneNumber: `+${country}${phoneNumber}`,
        },
      });

      this.setState({
        secret: data.secret,
        smsSent: true,
      });
    } catch (error) {
      if (error.status == 403) {
        this.props.history.push('/confirm-access?to=/settings/mfa-sms');
        return;
      }

      this.setState({
        error: error,
        loading: false,
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
        path: '/1/mfa/verify',
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
        codes: data,
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
      country,
      phoneNumber,
      code,
      codes,
      secret,
      verified,
    } = this.state;

    if (verified) {
      const countryCode = allCountries.find(
        (c) => c.name === country
      ).callingCode;

      return (
        <Finalize
          method="sms"
          requestBody={{
            secret,
            method: 'sms',
            phoneNumber: `+${countryCode}${phoneNumber}`,
            backupCodes: codes,
          }}
          codes={codes}
        />
      );
    }

    return (
      <PageCenter>
        <LogoTitle title="Set up SMS authentication" />
        <Segment.Group>
          <Segment>
            <Header size="small">1. What’s your mobile phone number?</Header>
            <p>Authentication codes will be sent to it.</p>
            <Form onSubmit={this.triggerSms} error={touched && !!error}>
              {error && <Message error content={error.message} />}
              <Form.Select
                options={countryCallingCodes}
                search
                value={country}
                label="Country Code"
                required
                type="text"
                autoComplete="tel-country-code"
                onChange={(e, { value }) => this.setState({ country: value })}
              />
              <Form.Input
                value={phoneNumber}
                label="Phone number"
                required
                type="tel"
                autoComplete="tel-local"
                onChange={(e, { value }) =>
                  this.setState({ phoneNumber: value.replace(/ /g, '') })
                }
              />
              <Form.Button type="submit" basic>
                Send authentication Code
              </Form.Button>
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
      </PageCenter>
    );
  }
}
