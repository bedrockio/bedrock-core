import React from 'react';
import { Link } from '@bedrockio/router';
import { Form, Button, Segment, Message, Grid } from 'semantic';

import screen from 'helpers/screen';

import LogoTitle from 'components/LogoTitle';
import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';

import { request } from 'utils/api';

@screen
export default class ForgotPassword extends React.Component {
  state = {
    success: false,
    loading: false,
    error: null,
    body: {},
  };

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
    this.setState({
      error: null,
      loading: true,
    });
    try {
      const { body } = this.state;
      await request({
        method: 'POST',
        path: '/1/auth/password/request',
        body,
      });
      this.setState({
        success: true,
        loading: false,
      });
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
        <LogoTitle title="Forgot Password" />
        <Segment.Group>
          <Segment padded>{this.renderBody()}</Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <Link to="/login">Login</Link>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <Link to="/signup">Dont have an account</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }

  renderBody() {
    const { success } = this.state;
    if (success) {
      return this.renderMessage();
    } else {
      return this.renderForm();
    }
  }

  renderMessage() {
    const { email } = this.state.body;
    return (
      <Message info>
        <Message.Header>Mail sent!</Message.Header>
        <p>
          Please follow the instructions in the email we sent to <b>{email}</b>
        </p>
      </Message>
    );
  }

  renderForm() {
    const { body, error, loading } = this.state;
    return (
      <Form
        size="large"
        error={!!error}
        loading={loading}
        onSubmit={this.onSubmit}>
        <ErrorMessage error={error} />
        <EmailField
          name="email"
          value={body.email || ''}
          onChange={this.setField}
        />
        <div>
          <Button
            fluid
            primary
            size="large"
            content="Request password"
            loading={loading}
            disabled={loading}
          />
        </div>
      </Form>
    );
  }
}
