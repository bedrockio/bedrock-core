import React from 'react';
import { Form, Modal, Message, Button } from 'semantic';
import { request } from 'utils/api';
import { screen } from 'helpers';

const countryCallingCodes = allCountries.map(({ nameEn, callingCode }) => ({
  value: callingCode,
  text: `${nameEn} +${callingCode}`,
  key: callingCode,
}));

@screen
export default class MFASms extends React.Component {
  static layout = 'none';

  state = {
    touched: false,
    loading: false,
    error: null,
    phoneNumber: '',
    countryCode: '+1',
    code: '',
    smsSent: false,
  };

  async triggerSms() {
    const { countryCode, code } = this.state;
    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/users/me/mfa/config',
        body: {
          method: 'sms',
          phoneNumber: `+${countryCode}${code}`,
        },
      });

      this.setState({
        smsSent: true,
      });
    } catch (error) {
      if (error.status == 403) {
        this.props.history.push(
          '/confirm-access?to=/settings/mfa-authenticator'
        );
        return;
      }

      this.setState({
        error,
        loading: false,
      });
    }
  }

  onSubmit = async () => {
    const { user } = this.state;
    this.setState({
      loading: true,
      touched: true,
    });

    try {
      await request({
        method: 'PATCH',
        path: `/1/users/${user.id}`,
        body: {
          ...user,
          roles: undefined,
        },
      });

      this.props.onSave();
      this.props.close();
    } catch (error) {
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
    } = this.state;
    return (
      <>
        <Modal.Header>Set up SMS authentication</Modal.Header>
        <Modal.Content>
          <p>
            We will send authentication codes to your mobile phone during sign
            in.
          </p>

          <Form onSubmit={this.triggerSms} error={touched && !!error}>
            {error && <Message error content={error.message} />}
            <Form.Select
              options={countryCallingCodes}
              search
              value={countryCode}
              label="Country code"
              required
              type="text"
              autoComplete="tel-country-code"
              onChange={(e, { value }) => this.setState({ countryCode: value })}
            />
            <Form.Input
              value={phoneNumber}
              label="Phone number"
              required
              type="tel"
              autoComplete="tel-local"
              onChange={(e, { value }) => this.setState({ phoneNumber: value })}
            />
            Authentication codes will be sent here.
            <Button type="submit">Send authentication Code</Button>
          </Form>

          <Form onSubmit={this.onSubmit} error={touched && !!error}>
            {error && <Message error content={error.message} />}
            Enter the six-digit code sent to your phone
            <Form.Input
              value={code}
              label="Phone number"
              required
              type="text"
              autoComplete="given-name"
              onChange={(e, { value }) => this.setState({ code: value })}
            />
            It may take a minute to arrive.
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            disabled={loading}
            content={'Enable'}
          />
        </Modal.Actions>
      </>
    );
  }
}
