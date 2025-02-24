import React from 'react';
import { Form, Button, Segment, Message } from 'semantic';
import { Link } from '@bedrockio/router';

import { withSession } from 'stores/session';

import screen from 'helpers/screen';

import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import PasswordField from 'components/form-fields/Password';

import { request } from 'utils/api';
import { getUrlToken } from 'utils/token';

@screen
@withSession
export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    const { token, payload } = getUrlToken();
    this.state = {
      token,
      payload,
      loading: false,
      touched: false,
      success: false,
      error: null,
      body: {},
    };
  }

  setField = (evt, { name, value }) => {
    this.setState({
      touched: true,
      body: {
        ...this.state.body,
        [name]: value,
      },
    });
  };

  onSubmit = async () => {
    try {
      const { password, repeat } = this.state.body;
      if (password !== repeat) {
        throw new Error('Passwords do not match.');
      }
      const { token } = this.state;
      this.setState({
        loading: true,
        error: null,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/password/update',
        token,
        body: {
          password,
        },
      });
      this.setState({
        loading: false,
        success: true,
      });
      this.props.history.push(await this.context.authenticate(data.token));
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <LogoTitle title="Reset Password" />
        <Segment.Group>
          <Segment padded>{this.renderBody()}</Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }

  renderBody() {
    const { payload, success } = this.state;
    if (!payload) {
      return this.renderTokenMissing();
    } else if (success) {
      return this.renderSuccessMessage();
    } else {
      return this.renderForm();
    }
  }

  renderTokenMissing() {
    return (
      <Message error>
        <Message.Header>No valid token found</Message.Header>
        <Message.Content>
          Please ensure you either click the email link in the email or copy
          paste the link in full.
        </Message.Content>
      </Message>
    );
  }

  renderSuccessMessage() {
    return (
      <Message info>
        <Message.Header>Your password has been changed!</Message.Header>
        <p>
          Click here to open the <Link to="/">Dashboard</Link>
        </p>
      </Message>
    );
  }

  renderForm() {
    const { body, touched, error } = this.state;
    return (
      <Form error={touched} size="large" onSubmit={this.onSubmit}>
        {error?.type !== 'validation' && <ErrorMessage error={error} />}
        <PasswordField
          name="password"
          placeholder="New Password"
          value={body.password || ''}
          onChange={this.setField}
          error={error}
        />

        <PasswordField
          name="repeat"
          placeholder="Repeat Password"
          value={body.repeat || ''}
          onChange={this.setField}
          error={error}
        />
        <Button fluid primary size="large" content="Reset Password" />
      </Form>
    );
  }
}
