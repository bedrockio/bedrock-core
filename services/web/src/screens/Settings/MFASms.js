import React from 'react';
import { Form, Message, Button, Segment, Header, Divider } from 'semantic';
import { request } from 'utils/api';
import { screen } from 'helpers';
import allCountries from 'utils/countries';

import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import { Link } from 'react-router-dom';

const countryCallingCodes = allCountries.map(({ nameEn, callingCode }) => ({
  value: callingCode,
  text: `${nameEn} (+${callingCode})`,
  key: `${nameEn}-${callingCode}`,
}));

@screen
export default class MFASms extends React.Component {
  static layout = 'none';

  state = {
    touched: false,
    loading: false,
    error: null,
    phoneNumber: '',
    countryCode: '',
    code: '',
    smsSent: false,
  };

  triggerSms = async () => {
    const { countryCode, phoneNumber } = this.state;
    this.setState({
      smsSent: false,
    });
    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/users/me/mfa/config',
        body: {
          method: 'sms',
          phoneNumber: `+${countryCode}${phoneNumber}`,
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
        configError: error,
        loading: false,
      });
    }
  };

  onSubmit = async () => {
    const { countryCode, phoneNumber } = this.state;
    this.setState({
      loading: true,
      touched: true,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/users/me/mfa/enable',
        body: {
          code: this.state.code,
          secret: this.state.secret,
          phoneNumber: `+${countryCode}${phoneNumber}`,
          method: 'sms',
        },
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

  render() {
    const {
      touched,
      loading,
      error,
      countryCode,
      phoneNumber,
      code,
      configError,
    } = this.state;

    return (
      <PageCenter>
        <LogoTitle title="Set up SMS authentication" />

        <Segment.Group>
          <Segment>
            <Header size="small">1. What’s your mobile phone number?</Header>
            <p>Authentication codes will be sent to it.</p>
            <Form onSubmit={this.triggerSms} error={touched && !!configError}>
              {configError && <Message error content={configError.message} />}
              <Form.Select
                options={countryCallingCodes}
                search
                value={countryCode}
                label="Country Code"
                required
                type="text"
                autoComplete="tel-country-code"
                onChange={(e, { value }) =>
                  this.setState({ countryCode: value })
                }
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
            <Form
              id="authenticator-form"
              onSubmit={this.onSubmit}
              error={touched && !!error}>
              {error && <Message error content={error.message} />}

              <Form.Input
                value={code}
                disabled={!this.state.smsSent}
                label="Enter the six-digit code sent to your phone"
                required
                placeholder="e.g. 423056"
                type="text"
                autoComplete="given-name"
                onChange={(e, { value }) => this.setState({ code: value })}
              />
            </Form>
          </Segment>
          <Segment>
            <Button
              form="authenticator-form"
              primary
              loading={loading}
              disabled={loading || code.length !== 6}
              content={'Enable'}
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
